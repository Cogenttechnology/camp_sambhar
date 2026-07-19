import fs from 'fs'
import path from 'path'

// Minimal .env loader.
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
  const sanitized = await config

  const { generateTypes } = await import('payload/node')
  await generateTypes(sanitized as never)
  console.log('✓ payload-types.ts generated')

  const { generateImportMap } = await import('payload')
  await generateImportMap(sanitized as never, { log: true })
  console.log('✓ importMap.js generated')

  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
