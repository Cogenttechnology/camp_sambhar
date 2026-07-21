/**
 * Knock the solid white ground out of the line-art illustrations.
 *
 * Several illustrations were saved as opaque RGB with a white background baked
 * in. That is invisible on an ivory section but shows as a hard white rectangle
 * over a photo or a dark band — and no blend mode fixes it honestly.
 *
 * The drawings are dark strokes on white, so luminance maps cleanly to coverage:
 * white ground -> alpha 0, black stroke -> alpha 255. Deriving alpha per pixel
 * (rather than keying an exact colour) preserves the anti-aliased edges, so the
 * strokes stay smooth instead of turning into jagged 1-bit cutouts.
 *
 * Run: tsx scripts/knockout-illustrations.ts
 * Idempotent — files that already carry real transparency are skipped.
 */
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'illustrations')

// route-map.png is deliberately excluded: its parchment ground is part of the
// artwork, not a background to remove.
const FILES = [
  'constellation.png',
  'curlew.png',
  'flamingo.png',
  'grass.png',
  'salt-crystals.png',
]

// acacia-khejri.png arrived inverted — a white engraving on a solid BLACK plate,
// the opposite of every other illustration. Knocking out "white" would erase the
// drawing and keep the box, so it gets the mirrored treatment: dark ground goes
// transparent, and the pale strokes are inverted to dark ink to match the set.
const INVERTED_FILES = ['acacia-khejri.png']

// border-ornament.png has a full-frame gradient wash baked behind a thin band of
// grasses and birds. A luma threshold cannot separate them — the wash and the
// strokes overlap in tone — so instead each row's own median is taken as the
// local wash level and only pixels darker than it survive as ink.
const WASHED_FILES = ['border-ornament.png']

/** Luminance at/above this is fully transparent; below WHITE_FLOOR fully opaque. */
const WHITE_CEIL = 246
const WHITE_FLOOR = 200

async function knockout(file: string) {
  const src = path.join(dir, file)

  const meta = await sharp(src).metadata()
  if (meta.hasAlpha) {
    const { isOpaque } = await sharp(src).stats()
    if (!isOpaque) {
      console.log(`  skip  ${file} — already transparent`)
      return
    }
  }

  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Rec. 601 luma — matches perceived lightness better than a flat mean.
    const luma = 0.299 * r + 0.587 * g + 0.114 * b

    let alpha: number
    if (luma >= WHITE_CEIL) {
      alpha = 0
    } else if (luma <= WHITE_FLOOR) {
      alpha = 255
    } else {
      // Ramp across the transition band so anti-aliased edges stay soft.
      alpha = Math.round(((WHITE_CEIL - luma) / (WHITE_CEIL - WHITE_FLOOR)) * 255)
    }

    data[i + 3] = alpha
  }

  await sharp(data, { raw: { width, height, channels } }).png({ compressionLevel: 9 }).toFile(src)
  console.log(`  ok    ${file} — background knocked out`)
}

/**
 * Returns true once the file already reads as knocked-out line art: mostly
 * transparent with sparse ink. Both passes below rewrite their own source, and
 * re-running either on its own output destroys the drawing — so they must be
 * able to recognise finished work and leave it alone.
 */
async function alreadyDone(src: string, minTransparent = 0.5) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let clear = 0
  const total = data.length / info.channels
  for (let i = 3; i < data.length; i += info.channels) if (data[i] === 0) clear++
  return clear / total >= minTransparent
}

/** Dark ground -> transparent, pale strokes -> dark ink. */
async function knockoutInverted(file: string) {
  const src = path.join(dir, file)

  if (await alreadyDone(src)) {
    console.log(`  skip  ${file} — already knocked out`)
    return
  }

  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info

  const BLACK_FLOOR = 40
  const BLACK_CEIL = 200

  for (let i = 0; i < data.length; i += channels) {
    const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]

    const alpha =
      luma <= BLACK_FLOOR
        ? 0
        : luma >= BLACK_CEIL
          ? 255
          : Math.round(((luma - BLACK_FLOOR) / (BLACK_CEIL - BLACK_FLOOR)) * 255)

    // Invert to ink, then warm it slightly so it sits with the sepia plates
    // rather than reading as pure black.
    const ink = Math.max(0, Math.min(255, Math.round((255 - luma) * 0.55 + 30)))
    data[i] = ink
    data[i + 1] = Math.round(ink * 0.92)
    data[i + 2] = Math.round(ink * 0.85)
    data[i + 3] = alpha
  }

  await sharp(data, { raw: { width, height, channels } }).png({ compressionLevel: 9 }).toFile(src)
  console.log(`  ok    ${file} — inverted plate, background knocked out`)
}

/** Remove a baked-in gradient wash by comparing each pixel to its row's median. */
async function knockoutWash(file: string) {
  const src = path.join(dir, file)

  if (await alreadyDone(src, 0.9)) {
    console.log(`  skip  ${file} — already knocked out`)
    return
  }

  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info

  // Deviations smaller than this are wash noise, not ink — without the dead zone
  // a faint haze survives over light backgrounds.
  const DEAD_ZONE = 6

  const out = Buffer.alloc(width * height * 4)
  const row = new Float64Array(width)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels
      row[x] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    }

    // 60th percentile, not the mean: the art is sparse, so this tracks the wash
    // itself rather than being dragged down by the strokes.
    const wash = Array.from(row).sort((a, b) => a - b)[Math.floor(width * 0.6)]

    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4
      const delta = wash - row[x] - DEAD_ZONE
      const alpha = delta <= 0 ? 0 : Math.max(0, Math.min(255, Math.round(delta * 9)))
      const ink = Math.max(0, Math.min(255, Math.round(55 - delta * 2)))

      out[o] = ink
      out[o + 1] = Math.round(ink * 0.9)
      out[o + 2] = Math.round(ink * 0.82)
      out[o + 3] = alpha
    }
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(src)
  console.log(`  ok    ${file} — gradient wash removed`)
}

console.log('Knocking out illustration backgrounds…')
for (const f of FILES) await knockout(f)
for (const f of INVERTED_FILES) await knockoutInverted(f)
for (const f of WASHED_FILES) await knockoutWash(f)
console.log('Done.')
