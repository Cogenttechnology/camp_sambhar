/**
 * Sort and process the newly supplied ChatGPT assets:
 *  - rename into meaningful paths
 *  - knock the white/solid background out of line-art so it overlays cleanly
 *  - keep the food photo as a normal JPEG
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const P = path.resolve(process.cwd(), 'public/photos')
const ILL = path.resolve(process.cwd(), 'public/illustrations')
const TEX = path.resolve(process.cwd(), 'public/textures')
const FOOD = path.resolve(process.cwd(), 'public/food')

const SRC = {
  laalMaas: 'ChatGPT Image Jul 19, 2026, 03_11_37 PM.png',
  ornament: 'ChatGPT Image Jul 19, 2026, 03_11_54 PM.png',
  acacia: 'ChatGPT Image Jul 19, 2026, 03_12_08 PM.png',
  camel: 'ChatGPT Image Jul 19, 2026, 03_12_37 PM.png',
  topo: 'ChatGPT Image Jul 19, 2026, 03_12_55 PM.png',
}

/**
 * Make light pixels transparent so line-art sits on any background.
 * Luminance drives alpha: near-white → fully transparent, dark ink → opaque.
 */
async function knockOutBackground(src: string, dest: string, threshold = 238) {
  const img = sharp(src, { failOn: 'none' }).ensureAlpha()
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const out = Buffer.alloc(width * height * 4)

  for (let i = 0, o = 0; i < data.length; i += channels, o += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const lum = 0.299 * r + 0.587 * g + 0.114 * b
    out[o] = r
    out[o + 1] = g
    out[o + 2] = b
    // Fade out anything brighter than the threshold; keep ink fully opaque.
    out[o + 3] = lum >= threshold ? 0 : Math.round(255 * Math.min(1, (threshold - lum) / 60))
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(dest)
  console.log('  ✓', path.basename(dest))
}

const run = async () => {
  fs.mkdirSync(FOOD, { recursive: true })

  // 1. Food photo — Laal Maas (our signature dish)
  console.log('→ Food')
  await sharp(path.join(P, SRC.laalMaas), { failOn: 'none' })
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(FOOD, 'laal-maas.jpg'))
  console.log('  ✓ laal-maas.jpg')

  // 2. Line-art illustrations — knock out the white background
  console.log('→ Illustrations (background removed)')
  await knockOutBackground(path.join(P, SRC.acacia), path.join(ILL, 'acacia-khejri.png'))
  await knockOutBackground(path.join(P, SRC.camel), path.join(ILL, 'camel.png'))

  // 3. Ornament divider — came with a solid gradient bg, so knock out the light
  //    areas and keep only the drawn motif.
  console.log('→ Ornament divider')
  await knockOutBackground(path.join(P, SRC.ornament), path.join(ILL, 'border-ornament.png'), 200)

  // 4. Topographic tile — becomes a texture
  console.log('→ Texture')
  await sharp(path.join(P, SRC.topo), { failOn: 'none' })
    .resize({ width: 1200 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(TEX, 'topo-lines.png'))
  console.log('  ✓ topo-lines.png')

  // 5. Tidy: remove the original long-named files
  for (const f of Object.values(SRC)) {
    const p = path.join(P, f)
    if (fs.existsSync(p)) fs.unlinkSync(p)
  }
  console.log('\n✓ Assets sorted.')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
