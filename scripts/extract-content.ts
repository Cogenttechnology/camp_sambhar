/**
 * Extract plain text from the client's DOCX/XLSX content files.
 * DOCX/XLSX are ZIP archives of XML — we unzip in-memory and strip tags,
 * so no extra dependency is needed beyond Node's zlib.
 */
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

const ROOT = path.resolve(process.cwd(), 'Camp Sambhar Resort Website Content - Phase 1 - Cogent')
const OUT = path.resolve(process.cwd(), 'content-extracted')

/** Minimal ZIP reader: returns { name: Buffer } for all entries. */
function readZipEntries(buf: Buffer): Record<string, Buffer> {
  const out: Record<string, Buffer> = {}
  // Find End of Central Directory
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

    // Local header to find data start
    const lhNameLen = buf.readUInt16LE(localOff + 26)
    const lhExtraLen = buf.readUInt16LE(localOff + 28)
    const dataStart = localOff + 30 + lhNameLen + lhExtraLen
    const data = buf.subarray(dataStart, dataStart + compSize)

    try {
      out[name] = compMethod === 0 ? Buffer.from(data) : zlib.inflateRawSync(data)
    } catch {
      /* skip unreadable entry */
    }
    ptr += 46 + nameLen + extraLen + commentLen
  }
  return out
}

/** Convert WordprocessingML to readable text, preserving paragraphs/lists. */
function docxToText(xml: string): string {
  let s = xml
  s = s.replace(/<w:tab[^>]*\/>/g, '\t')
  s = s.replace(/<w:br[^>]*\/>/g, '\n')
  // paragraph boundaries
  s = s.replace(/<\/w:p>/g, '\n')
  // strip all remaining tags
  s = s.replace(/<[^>]+>/g, '')
  // decode entities
  s = s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
  // tidy
  return s
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 0)
    .join('\n')
}

/** Convert SpreadsheetML to rows of text (uses sharedStrings). */
function xlsxToText(entries: Record<string, Buffer>): string {
  const sharedRaw = entries['xl/sharedStrings.xml']?.toString('utf8') ?? ''
  const shared: string[] = []
  for (const m of sharedRaw.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    shared.push(
      m[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim(),
    )
  }
  const lines: string[] = []
  for (const [name, buf] of Object.entries(entries)) {
    if (!/^xl\/worksheets\/sheet\d+\.xml$/.test(name)) continue
    const xml = buf.toString('utf8')
    lines.push(`\n### ${name}`)
    for (const row of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
      const cells: string[] = []
      for (const c of row[1].matchAll(/<c[^>]*?(?:\st="(\w+)")?[^>]*>([\s\S]*?)<\/c>/g)) {
        const type = c[1]
        const vm = c[2].match(/<v>([\s\S]*?)<\/v>/)
        const im = c[2].match(/<is>[\s\S]*?<t[^>]*>([\s\S]*?)<\/t>/)
        let val = ''
        if (im) val = im[1]
        else if (vm) val = type === 's' ? (shared[Number(vm[1])] ?? '') : vm[1]
        val = val.replace(/<[^>]+>/g, '').trim()
        if (val) cells.push(val)
      }
      if (cells.length) lines.push(cells.join(' | '))
    }
  }
  return lines.join('\n')
}

/** Very rough PDF text extraction: pull text between BT/ET show-text operators. */
function pdfToText(buf: Buffer): string {
  // Locate streams by index scanning (regex backtracks badly on large PDFs).
  const chunks: string[] = []
  const raw = buf.toString('latin1')
  let pos = 0
  while (true) {
    const sIdx = raw.indexOf('stream', pos)
    if (sIdx === -1) break
    let dataStart = sIdx + 'stream'.length
    if (raw[dataStart] === '\r') dataStart++
    if (raw[dataStart] === '\n') dataStart++
    const eIdx = raw.indexOf('endstream', dataStart)
    if (eIdx === -1) break
    pos = eIdx + 'endstream'.length

    const data = Buffer.from(raw.slice(dataStart, eIdx), 'latin1')
    let text = ''
    try {
      text = zlib.inflateSync(data).toString('latin1')
    } catch {
      try {
        text = zlib.inflateRawSync(data).toString('latin1')
      } catch {
        continue // binary (image/font) stream — skip
      }
    }
    if (!/[(\[]/.test(text)) continue
    // extract (…) Tj  and  [(…)…] TJ
    for (const t of text.matchAll(/\(((?:[^()\\]|\\.)*)\)\s*Tj/g)) chunks.push(unescapePdf(t[1]))
    for (const t of text.matchAll(/\[((?:[^\][]|\\.)*)\]\s*TJ/g)) {
      const parts = [...t[1].matchAll(/\(((?:[^()\\]|\\.)*)\)/g)].map((p) => unescapePdf(p[1]))
      if (parts.length) chunks.push(parts.join(''))
    }
  }
  return chunks
    .join('\n')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
}
function unescapePdf(s: string): string {
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\(\d{1,3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)))
}

function walk(dir: string): string[] {
  const out: string[] = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(p))
    else out.push(p)
  }
  return out
}

const run = () => {
  if (!fs.existsSync(ROOT)) {
    console.error('Content folder not found:', ROOT)
    process.exit(1)
  }
  fs.mkdirSync(OUT, { recursive: true })

  const files = walk(ROOT).filter((f) => /\.(docx|xlsx|pdf)$/i.test(f))
  for (const file of files) {
    const rel = path.relative(ROOT, file)
    const safe = rel.replace(/[\\/]/g, '__').replace(/\.[a-z]+$/i, '.txt')
    const dest = path.join(OUT, safe)
    if (fs.existsSync(dest) && fs.statSync(dest).size > 80) {
      console.log(`   skip (done)  ${rel}`)
      continue
    }
    let text = ''
    try {
      const buf = fs.readFileSync(file)
      if (/\.docx$/i.test(file)) {
        const entries = readZipEntries(buf)
        const doc = entries['word/document.xml']
        text = doc ? docxToText(doc.toString('utf8')) : '(no document.xml)'
      } else if (/\.xlsx$/i.test(file)) {
        text = xlsxToText(readZipEntries(buf))
      } else {
        text = pdfToText(buf)
      }
    } catch (err) {
      text = `(failed: ${(err as Error).message})`
    }
    fs.writeFileSync(path.join(OUT, safe), `SOURCE: ${rel}\n\n${text}\n`, 'utf8')
    console.log(`${text.length.toString().padStart(7)}  ${rel}`)
  }
  console.log(`\nWrote ${files.length} files to ${OUT}`)
}

run()
