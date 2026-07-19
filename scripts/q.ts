import fs from 'fs'; import path from 'path'
const envPath = path.resolve(process.cwd(), '.env')
for (const line of fs.readFileSync(envPath,'utf8').split('\n')) { const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/); if (m && !line.trim().startsWith('#')) { if(!(m[1] in process.env)) process.env[m[1]]=m[2].replace(/^["']|["']$/g,'') } }
const run = async () => {
  const { getPayload } = await import('payload'); const { default: config } = await import('../src/payload.config')
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection:'experiences', depth:2, limit:10 })
  docs.forEach((d:any)=>console.log(d.slug, '->', d.heroImage?.filename))
  process.exit(0)
}
run()
