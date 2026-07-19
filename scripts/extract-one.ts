/** Extract a single file (docx/pdf) — used for the stragglers. */
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

function readZipEntries(buf: Buffer): Record<string, Buffer> {
  const out: Record<string, Buffer> = {}
  let eocd = -1
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd < 0) return out
  const entries = buf.readUInt16LE(eocd + 10)
  let ptr = buf.readUInt32LE(eocd + 16)
  for (let e = 0; e < entries; e++) {
    if (buf.readUInt32LE(ptr) !== 0x02014b50) break
    const compMethod = buf.readUInt16LE(ptr + 10)
    const compSize = buf.readUInt32LE(ptr + 20)
    const nameLen = buf.readUInt16LE(ptr + 28)
    const extraLen = buf.readUInt16LE(ptr + 30)
    const commentLen = buf.readUInt16LE(ptr + 32)
    const localOff = buf.readUInt32LE(ptr + 42)
    const name = buf.subarray(ptr + 46, ptr + 46 + nameLen).toString('utf8')
    const lhNameLen = buf.readUInt16LE(localOff + 26)
    const lhExtraLen = buf.readUInt16LE(localOff + 28)
    const dataStart = localOff + 30 + lhNameLen + lhExtraLen
    const data = buf.subarray(dataStart, dataStart + compSize)
    try {
      out[name] = compMethod === 0 ? Buffer.from(data) : zlib.inflateRawSync(data)
    } catch {}
    ptr += 46 + nameLen + extraLen + commentLen
  }
  return out
}

function docxToText(xml: string): string {
  let s = xml
  s = s.replace(/<w:tab[^>]*\/>/g, '\t').replace(/<w:br[^>]*\/>/g, '\n').replace(/<\/w:p>/g, '\n')
  s = s.replace(/<[^>]+>/g, '')
  s = s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
  return s.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n')
}

function unescapePdf(s: string): string {
  return s
    .replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\\/g, '\\')
    .replace(/\\(\d{1,3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)))
}

function pdfToText(buf: Buffer): string {
  const chunks: string[] = []
  const raw = buf.toString('latin1')
  let pos = 0
  while (true) {
    const sIdx = raw.indexOf('stream', pos)
    if (sIdx === -1) break
    let dataStart = sIdx + 6
    if (raw[dataStart] === '\r') dataStart++
    if (raw[dataStart] === '\n') dataStart++
    const eIdx = raw.indexOf('endstream', dataStart)
    if (eIdx === -1) break
    pos = eIdx + 9
    const data = Buffer.from(raw.slice(dataStart, eIdx), 'latin1')
    let text = ''
    try {
      text = zlib.inflateSync(data).toString('latin1')
    } catch {
      continue
    }
    if (text.length > 2_000_000) continue
    for (const t of text.matchAll(/\(((?:[^()\\]|\\.){0,2000})\)\s*Tj/g)) chunks.push(unescapePdf(t[1]))
    for (const t of text.matchAll(/\[((?:[^\][\\]|\\.){0,4000})\]\s*TJ/g)) {
      const parts = [...t[1].matchAll(/\(((?:[^()\\]|\\.){0,2000})\)/g)].map((p) => unescapePdf(p[1]))
      if (parts.length) chunks.push(parts.join(''))
    }
  }
  return chunks.join('\n').split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n')
}

const src = process.argv[2]
const dest = process.argv[3]
const buf = fs.readFileSync(src)
let text = ''
if (/\.docx$/i.test(src)) {
  const entries = readZipEntries(buf)
  text = entries['word/document.xml'] ? docxToText(entries['word/document.xml'].toString('utf8')) : '(none)'
} else {
  text = pdfToText(buf)
}
fs.mkdirSync(path.dirname(dest), { recursive: true })
fs.writeFileSync(dest, `SOURCE: ${path.basename(src)}\n\n${text}\n`, 'utf8')
console.log(`${text.length} chars -> ${dest}`)
