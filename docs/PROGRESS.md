# Progress / handoff

**Current phase:** 0 → 1. Phase 0 done except Supabase accounts. Phase 1 plan in `docs/PLAN.md`,
waiting for Stan's approval.

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
- [x] iOS standalone detection also checks `navigator.standalone`
- [x] Hosting: Cloudflare Workers (static assets), auto-deploy on push to `main`
      → https://ijzer.stanvandenbulck.workers.dev — verified: pages, deep links (SPA fallback),
      manifest, service worker, fonts, security headers from `public/_headers`

## Waiting for Stan

- [ ] Supabase account with projects `ijzer-dev` and `ijzer-prod` (needed at the start of phase 1)
- [ ] Approve the phase 1 plan

## Decisions from Stan

- Keep-alive against Supabase pausing: **yes** (build in phase 1 once the projects exist).
- iPhone test 2026-11-19: installed on the home screen, opens fine. Stan expected a working app;
  explained that phase 0 is only the placeholder. Real landing page + login come in phase 1.

## Not done yet in phase 0

- Preview URLs per branch/PR: Cloudflare offers them, check once we use a branch
- Supabase CLI link (blocked on the projects)
- Lighthouse PWA check against the deployed URL

## Known issues

- `npm audit` reports 4 moderate advisories in dev-only tooling; none ship to the browser. Recheck in phase 1.
