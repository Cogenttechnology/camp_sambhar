/** Extract the SaltBox menu from XLSX with proper shared-string resolution. */
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

function readZipEntries(buf: Buffer): Record<string, Buffer> {
  const out: Record<string, Buffer> = {}
  let eocd = -1
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break }
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
    try { out[name] = compMethod === 0 ? Buffer.from(data) : zlib.inflateRawSync(data) } catch {}
    ptr += 46 + nameLen + extraLen + commentLen
  }
  return out
}

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
   .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
   .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))

const src = process.argv[2]
const dest = process.argv[3]
const entries = readZipEntries(fs.readFileSync(src))

// Shared strings: concatenate ALL <t> runs inside each <si>
const sharedXml = entries['xl/sharedStrings.xml']?.toString('utf8') ?? ''
const shared: string[] = []
for (const si of sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
  const parts = [...si[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => decode(m[1]))
  shared.push(parts.join('').trim())
}

const lines: string[] = []
for (const [name, buf] of Object.entries(entries)) {
  if (!/^xl\/worksheets\/sheet\d+\.xml$/.test(name)) continue
  const xml = buf.toString('utf8')
  lines.push(`\n### ${name}`)
  for (const row of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells: string[] = []
    for (const c of row[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = c[1]
      const inner = c[2]
      const isShared = /\st="s"/.test(attrs)
      const vm = inner.match(/<v>([\s\S]*?)<\/v>/)
      const im = inner.match(/<is>[\s\S]*?<t[^>]*>([\s\S]*?)<\/t>/)
      let val = ''
      if (im) val = decode(im[1])
      else if (vm) val = isShared ? (shared[Number(vm[1])] ?? '') : vm[1]
      val = val.trim()
      if (val) cells.push(val)
    }
    if (cells.length) lines.push(cells.join(' | '))
  }
}
fs.mkdirSync(path.dirname(dest), { recursive: true })
fs.writeFileSync(dest, lines.join('\n'), 'utf8')
console.log('shared strings:', shared.length, '→', dest)
