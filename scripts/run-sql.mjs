// Runs a SQL file on a Supabase project through the Management API.
// The access token is NOT in this repo: locally set SUPABASE_ACCESS_TOKEN (never commit it);
// in Claude's cloud session the network proxy adds it.
// Usage: node scripts/run-sql.mjs <file.sql> [dev|prod]
import { readFile } from 'node:fs/promises'
import { PROJECTS } from './supabase-projects.mjs'

const [file, target = 'dev'] = process.argv.slice(2)
if (!file || !PROJECTS[target]) {
  console.error('Usage: node scripts/run-sql.mjs <file.sql> [dev|prod]')
  process.exit(2)
}
const headers = { 'Content-Type': 'application/json' }
if (process.env.SUPABASE_ACCESS_TOKEN) headers.Authorization = `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`
const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECTS[target].ref}/database/query`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ query: await readFile(file, 'utf8') }),
})
const body = await res.text()
console.log(`${target} HTTP ${res.status}: ${body.slice(0, 2000)}`)
if (!res.ok || /FAIL/.test(body)) process.exit(1)
