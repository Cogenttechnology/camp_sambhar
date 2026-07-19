import fs from 'fs'
import sharp from 'sharp'

const run = async () => {
  const src = fs.readFileSync('public/logo.png')
  const meta = await sharp(src, { failOn: 'none' }).metadata()
  const size = Math.min(meta.width!, meta.height!)
  const left = Math.floor((meta.width! - size) / 2)
  const top = Math.floor((meta.height! - size) / 2)
  const out = await sharp(src, { failOn: 'none' })
    .extract({ left, top, width: size, height: size })
    .resize(64, 64, { fit: 'contain', background: { r: 243, g: 235, b: 221, alpha: 1 } })
    .png()
    .toBuffer()
  fs.writeFileSync('src/app/icon.png', out)
  console.log('wrote src/app/icon.png', out.length, 'bytes')
}
run().catch((e) => {
  console.error(e)
  process.exit(1)
})
