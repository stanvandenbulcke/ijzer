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

/** Legacy Supabase keys are JWTs: only the "anon" role may ever be in the bundle. */
function forbiddenJwts(text) {
  const hits = []
  for (const [token] of text.matchAll(/eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+/g)) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'))
      if (payload.role !== 'anon') hits.push(payload.role ?? 'unknown role')
    } catch {
      hits.push('unreadable JWT')
    }
  }
  return hits
}

let found = 0
for await (const file of walk('dist')) {
  const text = await readFile(file, 'utf8')
  for (const role of forbiddenJwts(text)) {
    console.error(`SECRET? JWT with role "${role}" in ${file}`)
    found++
  }
  for (const [label, re] of patterns) {
    if (re.test(text)) {
      console.error(`SECRET? ${label} in ${file}`)
      found++
    }
  }
}
if (found) process.exit(1)
console.log('No secrets found in dist/')
