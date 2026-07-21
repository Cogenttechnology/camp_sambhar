/**
 * Repair the UI icons in /public/icons.
 *
 * Two faults, both present since the assets were handed over:
 *
 * 1. All four were saved as opaque RGB with a white ground baked in, so they
 *    rendered as white boxes on the ivory sections. Luminance maps to alpha,
 *    which keeps the anti-aliased stroke edges soft.
 *
 * 2. family.png is truncated — exactly 131072 bytes, no IEND chunk, and the
 *    decoder produces a black band below row 333. The copy in
 *    Camp-Sambhar-Website-Assets/04-UI-Icons is byte-identical, so the file was
 *    already damaged before delivery and there is nothing to recover from. The
 *    lower third of the drawing does not exist in any surviving copy, so it is
 *    redrawn here as SVG using the geometry measured off the intact upper 65%
 *    (stroke #8A7561 at 9px, heads r=46 at y=120, bodies rising from y≈252).
 *
 * Run: tsx scripts/fix-icons.ts   — idempotent, skips already-fixed files.
 */
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')

const WHITE_CEIL = 246
const WHITE_FLOOR = 200

/** Reconstruction of the truncated family icon, matching the original's line. */
const FAMILY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <g fill="none" stroke="#8A7561" stroke-width="9" stroke-linecap="round">
    <circle cx="150" cy="120" r="46"/>
    <circle cx="362" cy="120" r="46"/>
    <path d="M96 380 V252 a54 54 0 0 1 108 0 V380"/>
    <path d="M308 380 V252 a54 54 0 0 1 108 0 V380"/>
    <circle cx="256" cy="276" r="34"/>
    <path d="M212 380 V354 a44 44 0 0 1 88 0 V380"/>
  </g>
</svg>`

async function isTransparent(file: string) {
  const src = path.join(dir, file)
  const { data, info } = await sharp(src, { failOn: 'none' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  let clear = 0
  const total = data.length / info.channels
  for (let i = 3; i < data.length; i += info.channels) if (data[i] === 0) clear++
  return clear / total > 0.2
}

/** A PNG is complete only if it ends with the IEND chunk. */
function isIntact(file: string) {
  const buf = fs.readFileSync(path.join(dir, file))
  return buf.subarray(-12).toString('hex') === '0000000049454e44ae426082'
}

async function knockout(file: string) {
  const src = path.join(dir, file)

  if (await isTransparent(file)) {
    console.log(`  skip  ${file} — already transparent`)
    return
  }

  const { data, info } = await sharp(src, { failOn: 'none' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info

  for (let i = 0; i < data.length; i += channels) {
    const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    data[i + 3] =
      luma >= WHITE_CEIL
        ? 0
        : luma <= WHITE_FLOOR
          ? 255
          : Math.round(((WHITE_CEIL - luma) / (WHITE_CEIL - WHITE_FLOOR)) * 255)
  }

  await sharp(data, { raw: { width, height, channels } }).png({ compressionLevel: 9 }).toFile(src)
  console.log(`  ok    ${file} — white ground knocked out`)
}

console.log('Repairing UI icons…')

if (isIntact('family.png') && (await isTransparent('family.png'))) {
  console.log('  skip  family.png — already rebuilt')
} else {
  await sharp(Buffer.from(FAMILY_SVG))
    .png({ compressionLevel: 9 })
    .toFile(path.join(dir, 'family.png'))
  console.log('  ok    family.png — rebuilt (source file is truncated)')
}

for (const f of ['eco.png', 'binoculars.png', 'safety.png']) await knockout(f)

console.log('Done.')
