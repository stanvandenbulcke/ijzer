# Progress / handoff

**Current phase:** 0 — Fundament & setup (code part done, waiting for Stan's accounts)

## Done

- [x] SPEC copied unchanged to `docs/SPEC.md`
- [x] CLAUDE.md, docs/ (PLAN, DECISIONS, ARCHITECTURE, DATA_MODEL, DESIGN, SCIENCE, GIDS_VOOR_STAN)
- [x] Scaffold: Vite 8 + React 19 + TypeScript 6 (strict), React Router 8, Tailwind 4 with own tokens
- [x] Folder structure per SPEC §3.2 with a README per feature
- [x] ESLint (incl. feature-isolation + pure-domain rules), Prettier
- [x] Vitest + first domain function (`estimateOneRepMax`) with tests
- [x] Playwright e2e on 390×844 and 430×932, dark + light screenshots viewed
- [x] PWA manifest, service worker, temporary icon, self-hosted fonts
- [x] Secret scan of `dist/` (`npm run check:secrets`), GitHub Actions CI workflow
- [x] Pushed to GitHub (`stanvandenbulcke/ijzer`, private), CI green

## Waiting for Stan

- [ ] Hosting account (Cloudflare or Vercel) → first deploy + preview URLs
- [ ] Supabase account with projects `ijzer-dev` and `ijzer-prod` (needed at the start of phase 1)
- [ ] Answer: optional keep-alive against Supabase pausing? (SPEC §11.5)
- [ ] Test on iPhone: open the deployed URL in Safari, add to home screen

## Not done yet in phase 0

- Deploy and preview URLs (blocked on the accounts above)
- Supabase CLI link (blocked on the projects)
- Lighthouse PWA check against the deployed URL

## Known issues

- `npm audit` reports 4 moderate advisories in dev-only tooling; none ship to the browser. Recheck in phase 1.
