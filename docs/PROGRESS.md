# Progress / handoff

**Status (2026-11-19):** the gym side of the app works end to end in local mode (no accounts
yet). Live: https://ijzer.stanvandenbulck.workers.dev — auto-deploys on push to `main`.

## Done

### Phase 0 — foundation

- [x] Scaffold (Vite 8, React 19, TS 6 strict, React Router 8, Tailwind 4 with own tokens)
- [x] ESLint incl. own rule `eslint-rules/feature-boundaries.js` (no imports between features)
- [x] Vitest, Playwright (390×844 + 430×932), axe accessibility scans, secret scan, contrast check
- [x] GitHub `stanvandenbulcke/ijzer` + CI; Cloudflare Workers hosting with security headers
- [x] Service worker auto-update (ADR-016)

### Phase 1 — partly

- [x] Design system (`src/ui`), /design style page (online until Stan approves; ADR-009)
- [x] App shell: five tabs, running-workout bar, landing page (hero animation, demo screens)
- [x] Onboarding /welkom (6 steps, skippable, reused for editing; ADR-015)
- [ ] **Supabase: client, auth (e-mail + password, 6-digit OTP), `profiles` migration, RLS
      tests, CSP, keep-alive** — waiting for the project URL (ADR-010)

### Phase 2 — exercise library

- [x] Import of free-exercise-db: 736 exercises, 212 curated (ADR-011), WebP photos self-hosted
- [x] Search with abbreviations and typos, filters, detail page (flipbook, muscle map, history,
      alternatives, YouTube search link), custom exercises with tap-to-pick muscle map

### Phase 3 — routines and active workout

- [x] Routine builder (sets, rep range, RIR, set types, rest, progression model, note,
      supersets, reorder, duplicate) with live volume preview; example PPL routines to copy
- [x] Active workout: own keypad, last-time values, one-tap tick, progression target with
      "Waarom?", rest timer from timestamps + sound, wake lock, skip with reason, later,
      substitute, warm-up calculator, plate calculator, notes, pain flag, live PRs, saved to
      IndexedDB on every tap
- [x] Summary (stats, PRs, muscles, vs. last time, skipped, feeling, note, share image,
      "update routine?"), history list and detail

### Phase 4 / 6 — progress (core)

- [x] Vandaag: next routine in rotation, weekly streak (never punishes rest days), last PR,
      body weight with trend
- [x] Progressie: overview (calendar, weekly muscle map by zone, tonnage, PR feed), exercises
      (e1RM chart with periods, rep-PR table, sessions incl. skipped), muscles (weekly sets with
      target band, contributors, balance), body (weight + EMA trend), analysis (R1–R10)
- [x] Ik: settings (theme, rest, wake lock, sound), JSON export, wipe, credits

## Next (in order)

1. Supabase (needs project URL from Stan): auth, migrations, RLS tests, sync of the outbox.
2. Phase 5 nutrition (NEVO file from Stan, Open Food Facts, barcode, label scan).
3. Phase 6 rest: measurements, progress photos, adaptive TDEE, weekly check-in.
4. Phase 7 steps (Shortcuts), phase 8 buddies/import, phase 9 polish; Wetenschap articles.
5. After Stan approves the style: gate /design to dev (ADR-009).

## Waiting for Stan

- [ ] Supabase **Project URL** of `ijzer-dev` (the publishable key was received)
- [ ] Style approval on /design (or feedback)
- [ ] Test the app on the iPhone (steps in GIDS_VOOR_STAN.md)

## Known issues / notes

- `npm audit` reports moderate advisories in dev-only tooling; none ship to the browser.
- Routine reorder uses up/down buttons, not drag (ADR-014).
- Light theme: green as a chart colour on paper is just under 3:1 (text uses green-text).
