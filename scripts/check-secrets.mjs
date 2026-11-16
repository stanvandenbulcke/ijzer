// Fails the build pipeline if anything that looks like a secret ended up in dist/.
// Usage: npm run check:secrets   (run after `npm run build`)
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const patterns = [
  ['Supabase secret key', /sb_secret_[A-Za-z0-9_-]{10,}/],
  ['service_role JWT', /service_role/],
  ['Google API key', /AIza[0-9A-Za-z_-]{35}/],
  ['Private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
]

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else if (/\.(js|css|html|json|map|webmanifest)$/.test(entry.name)) yield path
  }
}

let found = 0
for await (const file of walk('dist')) {
  const text = await readFile(file, 'utf8')
  for (const [label, re] of patterns) {
    if (re.test(text)) {
      console.error(`SECRET? ${label} in ${file}`)
      found++
    }
  }
}
if (found) process.exit(1)
console.log('No secrets found in dist/')
