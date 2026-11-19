// Auth settings for a Supabase project (SPEC §4.1), applied via the Management API.
// Usage: node scripts/auth-config.mjs [dev|prod]
// - Sign-up without a confirmation e-mail: the built-in Supabase mailer only reaches members of
//   the Supabase organisation, so a confirmation mail would never arrive for anyone else.
// - Password reset by link (ADR-017): free projects cannot change mail templates with the
//   built-in mailer, so a 6-digit code is impossible without own SMTP. The link opens in Safari,
//   the new password is set there, and you log in with it in the home-screen app.
import { PROJECTS } from './supabase-projects.mjs'

const SITE = 'https://ijzer.stanvandenbulck.workers.dev'

const config = {
  site_url: SITE,
  uri_allow_list: `${SITE}/**,http://localhost:5173/**,http://localhost:4173/**`,
  mailer_autoconfirm: true,
  password_min_length: 8,
}

const target = process.argv[2] ?? 'dev'
const headers = { 'Content-Type': 'application/json' }
if (process.env.SUPABASE_ACCESS_TOKEN)
  headers.Authorization = `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`
const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECTS[target].ref}/config/auth`,
  {
    method: 'PATCH',
    headers,
    body: JSON.stringify(config),
  },
)
const body = await res.json().catch(() => ({}))
console.log(`${target} HTTP ${res.status}`)
for (const key of Object.keys(config)) {
  const ok = JSON.stringify(body[key]) === JSON.stringify(config[key])
  console.log(
    `${ok ? ' ok ' : 'DIFF'} ${key}${ok ? '' : ` = ${String(body[key] ?? body.message).slice(0, 80)}`}`,
  )
}
if (!res.ok) process.exit(1)
