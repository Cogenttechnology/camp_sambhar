import fs from 'fs'; import path from 'path'; import sharp from 'sharp'
const M = path.resolve(process.cwd(), 'media')
const OUT = path.resolve(process.cwd(), 'book/assets/img')
const jobs: [string, string, number][] = [
  ['drone-1.jpg', 'hero-camp-aerial.jpg', 1920],
  ['sambhar-1-21.jpg', 'flamingos-flight.jpg', 1400],
  ['sambhar-1-29-01.jpg', 'flamingos-group.jpg', 1000],
  ['common-28.jpg', 'flamingos-feeding.jpg', 1000],
  ['untitled-2261.jpg', 'bird-stonechat.jpg', 1000],
  ['str1.jpg', 'swiss-tent-interior.jpg', 1000],
  ['swiss-tent-image.jpg', 'swiss-tent-exterior.jpg', 1000],
  ['camp-sambhar-hiking-t-4.jpg', 'hiking-tent.jpg', 1000],
  ['res-4.jpg', 'saltbox-interior.jpg', 1200],
  ['stargazing-1.jpg', 'stargazing.jpg', 1200],
  ['pool.jpg', 'pool.jpg', 1000],
  ['drone-2.jpg', 'camp-aerial-2.jpg', 1200],
  ['sambhar-village-tour-1.jpg', 'village.jpg', 1000],
  ['10-salt-making-process.jpg', 'salt-making.jpg', 1000],
]
const run = async () => {
  fs.mkdirSync(OUT, { recursive: true })
  for (const [src, dest, w] of jobs) {
    const p = path.join(M, src)
    if (!fs.existsSync(p)) { console.log('  skip (missing)', src); continue }
    await sharp(p, { failOn: 'none' }).rotate().resize({ width: w, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true }).toFile(path.join(OUT, dest))
    console.log('  ✓', dest)
  }
  // logo
  const logo = path.resolve(process.cwd(), 'public/logo.png')
  if (fs.existsSync(logo)) { await sharp(logo).resize({ width: 300 }).png().toFile(path.join(OUT, 'logo.png')); console.log('  ✓ logo.png') }
}
run().catch(e => { console.error(e); process.exit(1) })
