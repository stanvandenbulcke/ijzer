# IJZER — project rules (read every session)

Fitness PWA (gym progression first, plus nutrition, body weight, steps, science coach).
Built with **Stan** (beginner programmer, Flemish). Full spec: `docs/SPEC.md` — the source of
truth; re-read it at the start of every phase. Never edit SPEC.md.

## Hard constraints

- **PWA only** (iOS Safari + home screen). No native, no Mac tooling.
- **Everything free.** No paid services/APIs, no trials, no trackers/analytics/ads.
- **UI in Dutch** (informal "je"), all strings in `src/i18n/nl.ts`. Code, comments, commits in
  English. Exercise names in English.
- Stan develops on **Windows** (PowerShell). No Docker, no `supabase start`.
- **No magic-link login** (iOS home-screen storage is separate from Safari). E-mail + password,
  reset via 6-digit OTP.
- **Security:** RLS on EVERY table, never disabled to "fix" something. `service_role` and Gemini
  keys only in Supabase secrets/edge functions. Frontend gets only the publishable key.
- **Honest data:** skipped/substituted exercises and unchecked sets are never zeros — they count
  nowhere (charts show a gap). Estimates are labelled as estimates.
- **Design ("Krijt & IJzer"):** only tokens from `src/ui/tokens.css`. Forbidden: purple/indigo
  gradients, Inter/Roboto/system brand font, centred hero + 3 feature cards, default
  shadcn/Tailwind look, emoji as icons, stock photos, soft grey shadows. See `docs/DESIGN.md`.
- Only media from free-exercise-db (Unlicense) or own SVGs.
- Don't decide Stan's personal preferences (name, style approval, what his girlfriend sees) — ask.

## Way of working

1. Phase by phase (SPEC §9). Start each phase by updating `docs/PLAN.md`; Stan approves; build.
2. Stop after each phase with a short Dutch summary: what works, how to test on iPhone,
   what Stan must do, one thing to learn (max 3 sentences).
3. Keep `docs/PROGRESS.md` current (handoff after `/clear`). ADRs in `docs/DECISIONS.md`.
4. Never say "done" without proof: `npm run check` + `npm run test:e2e` green and the
   screenshots in `test-results/screens/` actually looked at (390×844 and 430×932, dark + light).
5. Small commits, clear English messages, push at the end of every task group.
6. Ask Stan only what you cannot do yourself; numbered click-by-click steps, one thing at a time.
7. End of phase: security review (RLS, secrets, auth) + design review via subagents.
8. Check current docs for fast-moving things (Supabase CLI, Gemini models, OFF API, hosting).

## Commands

| Command                       | What it does                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| `npm run dev`                 | Dev server (http://localhost:5173)                                                          |
| `npm run check`               | typecheck + lint + unit tests + build + secret scan — run before every commit               |
| `npm run test` / `test:watch` | Vitest unit tests                                                                           |
| `npm run test:e2e`            | Playwright on iPhone viewports against the production build; writes screenshots             |
| `npm run lint` / `format`     | ESLint / Prettier                                                                           |
| `npm run build` / `preview`   | Production build / serve it locally                                                         |
| `npm run icons`               | Regenerate PNG icons from `public/icon.svg`                                                 |
| Deploy                        | Cloudflare Workers, automatic on push to `main` → https://ijzer.stanvandenbulck.workers.dev |
| Migrations                    | `supabase db push` after `supabase link` (from phase 1)                                     |

## Where is what

```
docs/            SPEC, PLAN, PROGRESS, DECISIONS, ARCHITECTURE, DATA_MODEL, DESIGN, SCIENCE, GIDS_VOOR_STAN
src/app/         router, providers, shell, error pages, config.ts (APP_NAME)
src/features/    one folder per tab/feature, each with a README and an index.ts (its public pages):
                 landing, onboarding, today, training/{library,routines,active-workout,summary,
                 history}, nutrition, progress/{overview,exercises,muscles,body,steps,analysis}, me
src/domain/      PURE TypeScript logic, no React, tested: strength/ (e1RM, plates, warm-ups,
                 progression), training/ (types, workout ops, performances, PRs, proposals,
                 summary, streak), volume/, analysis/ (rules R1–R10, thresholds), energy/ (trend),
                 exercises/ (search), muscles/ (taxonomy), profile/, time.ts
src/data/        Dexie db (+ outbox), repositories (*Repo.ts), catalog loader, useTrainingData
src/ui/          design system: tokens.css + shared components
src/i18n/        nl.ts (typed messages)
supabase/        migrations, functions, seed, tests (RLS)
scripts/         icons, secret scan, contrast check, exercise import (+ curated mapping)
public/data/     generated exercise catalog;  public/exercises/<id>/0|1.webp: photos
eslint-rules/    own lint rule: features never import each other
tests/e2e/       Playwright
```

## Code rules

- A feature never imports from another feature (ESLint enforces it). Shared code goes to
  `domain/`, `data/` or `ui/`. `domain/` imports nothing from React/ui/data.
- Files < ~300 lines. TypeScript strict + `noUncheckedIndexedAccess`.
- Internally always kg; dates with date-fns `nl-BE`, timezone Europe/Brussels.
- Dependencies are added in the phase that first uses them, not earlier.
- Every honesty rule for statistics lives in `src/domain/training/performances.ts`; use it.
- UI texts: `src/i18n/nl/<area>.ts`, one file per tab.
- TypeScript is pinned to 6.x until typescript-eslint supports 7 (see DECISIONS.md).

## Definition of Done (per task and phase)

- [ ] `npm run check` green; e2e green; screenshots viewed in both themes, no §6.1 anti-patterns
- [ ] Domain logic unit-tested incl. edge cases (empty data, skipped exercises, units, midnight)
- [ ] Accessibility: AA contrast, labels, focus order, 44 px tap targets
- [ ] RLS tests green (from phase 1); no secrets in the bundle
- [ ] PROGRESS.md, CLAUDE.md and docs updated; committed and pushed
- [ ] Short Dutch summary + test steps for Stan
