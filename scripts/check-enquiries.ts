import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
    if (m && !line.trim().startsWith('#')) {
      const [, k, v] = m
      if (!(k in process.env)) process.env[k] = v.replace(/^["']|["']$/g, '')
    }
  }
}

const run = async () => {
  const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })
  const r = await payload.find({ collection: 'enquiries', limit: 5, sort: '-createdAt' })
  console.log('ENQUIRIES total:', r.totalDocs)
  for (const d of r.docs) console.log(' -', d.name, '|', d.phone, '|', d.interest, '|', d.status)
  process.exit(0)
}
run().catch((e) => {
  console.error(e)
  process.exit(1)
})
