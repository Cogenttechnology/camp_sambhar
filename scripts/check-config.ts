import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

// Minimal .env loader (no dependency).
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
  try {
    const { default: config } = await import('../src/payload.config')
    const payload = await getPayload({ config })
    console.log('✓ Payload config loaded OK')
    console.log('Collections:', Object.keys(payload.collections).join(', '))
    process.exit(0)
  } catch (err) {
    console.error('✗ Config failed to load:')
    console.error(err)
    process.exit(1)
  }
}

run()
