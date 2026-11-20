# Progress / handoff

**Status (2026-11-20):** IRON works end to end with accounts and cloud sync on ijzer-prod:
gym (library, routines, workout, progress), food diary, body weight, progress photos, muscle
levels, Wrapped, check-in insights. Live: https://ijzer.stanvandenbulck.workers.dev
(auto-deploys on push to `main`).

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

## Round 2 (Stan's feedback, 2026-11-20)

- [x] Accounts + cloud sync built and tested against **ijzer-dev** (RLS tests green, e2e: two
      phones sync, local data kept on sign-up). **Live app still without accounts** until Stan
      approves setting up ijzer-prod (same migrations + `scripts/auth-config.mjs prod`, then fill
      `prod` in `src/data/supabase/config.ts` and add its host to the CSP).
- [x] Birth date dd/mm/jjjj, no plates step, no example routines, own exercise everywhere,
      visible Skip/Later/Replace, "Vorige keer", coach tip on Vandaag.
- [x] Motion: page transitions, tab indicator, count-ups, 3D body heat map, PR celebration,
      set stamp, animated duotone exercise icons, career stats + record wall.
- [ ] Name: Stan chooses (APP_NAME in `src/app/config.ts`).

## Round 3 (2026-11-20)

- [x] Name IRON (ADR-021); accounts live on ijzer-prod; several accounts on several phones.
- [x] Data-loss review fixed (ADR-022): safe sign-out, account switch asks first, claim screen
      comes back if the app was closed, compound pull cursor, server trigger hardening, row
      size limit, workout save retry + banner, persistent storage on every start, parallel and
      per-table sync, unit tests for push/pull.
- [x] New-user walkthrough fixed: ✓ on an empty set ticks after the keypad, finish sheet names
      open exercises and ticks typed sets, "Vandaag getraind", Dutch search (billen, buik,
      bulgaarse), simpler routine editor, map opens on the trained side, record plates in kg,
      theme can follow the iPhone, exercise info during a workout.
- [x] Race against yourself, own sounds, native feel (splash screens, no zoom, no bounce,
      swipe back, tab transitions).
- [x] Muscle levels, IRON Wrapped (/wrapped/:period), energy/sleep check-in + insights.
- [x] Food diary (ADR-023): targets, own products, portion sheet, quick add, copy yesterday,
      day complete, week overview, Today card.
- [x] Progress photos + timelapse, local only (ADR-024).

## Next (in order)

1. ~~Prod migration for nutrition~~ — applied 2026-11-20 with Stan's go; RLS tests pass on prod.
2. Samen trainen + buddies (Realtime) — needs Stan's choices on what the other person sees.
3. Barcode (Open Food Facts edge function; needs a contact address for the User-Agent), NEVO
   (Stan downloads the file), label/plate photo (free Google AI Studio key from Stan).
4. Adaptive TDEE + weekly check-in, measurements, steps (Shortcuts), recipes, supplements.
5. After Stan approves the style: gate /design to dev (ADR-009).

## Waiting for Stan

- [x] Go for the nutrition tables on ijzer-prod (given)
- [ ] Samen trainen: what may the other person see (live sets? weights? only "training")
- [ ] For barcodes: which e-mail address may go in the Open Food Facts User-Agent
- [ ] Optional: free Google AI Studio key (label and plate photos), NEVO download
- [ ] After both accounts exist: switch off open sign-ups in Supabase (fewer spam accounts)

## Known issues / notes

- Password reset mails only reach Stan until a free SMTP sender is set up (ADR-017).
- Progress photos are not in the JSON export (size); they stay on the device.
- `npm audit` reports moderate advisories in dev-only tooling; none ship to the browser.
- Routine reorder uses up/down buttons, not drag (ADR-014).
- Node scripts that call the Management API need `NODE_USE_ENV_PROXY=1` in the cloud sandbox.
