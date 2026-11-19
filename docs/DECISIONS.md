# Decisions (ADRs)

## ADR-001 — PWA instead of native

**Context:** iPhone user, Windows laptop, zero budget. Native iOS needs a Mac or a paid account.
**Decision:** Progressive Web App installed via Safari → "Zet op beginscherm" (SPEC §0.2).
**Consequences:** No direct Apple Health access (solved with a Shortcuts automation, §4.7); push
only when installed; can be wrapped with Capacitor later.

## ADR-002 — TypeScript pinned to 6.x

**Context:** `npm create vite` (Nov 2026) scaffolds TypeScript 7 and oxlint. The spec asks for
ESLint; typescript-eslint 8.73 only supports TypeScript `<6.1`.
**Decision:** Use ESLint + typescript-eslint as specified and pin `typescript@~6.0`.
**Consequences:** Slightly slower type checks. Revisit when typescript-eslint supports TS 7.

## ADR-003 — Dependencies are installed when first used

**Context:** SPEC §2 lists the full stack (Dexie, TanStack Query, Zustand, zod, Recharts, Motion,
date-fns, Supabase…).
**Decision:** Phase 0 installs only what it uses (React, React Router, Tailwind, PWA plugin,
fonts, test/lint tooling). The rest is added in the phase that needs it.
**Consequences:** Smaller bundle and fewer unused packages to keep up to date. The stack choice
itself is unchanged.

## ADR-004 — Tailwind default palette disabled

**Context:** SPEC §6 forbids the default Tailwind/shadcn look.
**Decision:** `src/ui/tokens.css` resets `--color-*`, `--radius-*` and `--shadow-*`; only our own
tokens exist as utilities. A separate `--accent-text` token exists because plate yellow fails
contrast as text on the light theme.
**Consequences:** `bg-blue-500` and friends simply do not exist; off-brand colours cannot slip in.

## ADR-005 — Project built in a cloud session first

**Context:** The first session ran in a Claude Code cloud container, not on Stan's laptop.
**Decision:** Build and verify there; GitHub is the hand-off point. Local Windows setup (Node,
Git, VS Code) is optional and documented in GIDS_VOOR_STAN.md.
**Consequences:** Nothing is safe until it is pushed to GitHub — the container is temporary.

## ADR-006 — Hosting on Cloudflare Workers (static assets)

**Context:** Need free HTTPS hosting with auto-deploy from GitHub (SPEC §2).
**Decision:** Cloudflare Workers with static assets, connected to the GitHub repo in the
Cloudflare dashboard (no wrangler file in the repo yet). Chosen over Vercel Hobby: no
non-commercial clause, no bandwidth cap.
**Consequences:** Every push to `main` deploys to https://ijzer.stanvandenbulck.workers.dev.
Deep links fall back to `index.html` (SPA). Security headers come from `public/_headers`.
CSP still to add once Supabase URLs are known (phase 1).

## ADR-007 — Plate colours split into fill and text tokens

**Context:** Plate yellow on paper has a contrast of 1.5:1, plate red and blue as small text
on dark surfaces fall below 4.5:1.
**Decision:** `plate-*` are fills and stay identical in both themes; `*-text` tokens are tuned
per theme for text. A separate `line-strong` token gives inputs a ≥ 3:1 border. A script checks
every pair on each build.
**Consequences:** Use `text-accent-text`, never `text-plate-yellow`, for text.

## ADR-008 — Lucide icons, Radix Dialog, no Motion library yet

**Context:** SPEC §2 allows Radix primitives and one icon set; Motion is listed for animation.
**Decision:** Lucide (`lucide-react`, pinned) as the single icon set. `@radix-ui/react-dialog`
for the bottom sheet. Phase 1 animations are plain CSS (`src/ui/motion.css`); Motion is added
when the PR and set-check animations need it (phase 3).
**Consequences:** Smaller bundle now; reduced-motion handled in one CSS rule.

## ADR-009 — /design temporarily online

**Context:** SPEC §6.2 says the /design page is dev-only, but Stan approves the style on his
iPhone, which only reaches the deployed site.
**Decision:** `/design` is lazy-loaded and online until Stan approves; then it is limited to
`import.meta.env.DEV`. Its technical captions (font and token names) are inline, not in i18n.
**Consequences:** Remember to gate the route after approval (tracked in PROGRESS.md).

## ADR-010 — Local-first without accounts until Supabase is linked

**Context:** Stan asked to build the full app while the Supabase project URL was not yet known.
Accounts need a working backend to test end to end.
**Decision:** The app runs in "lokale modus": onboarding creates a local profile, all data lives
in IndexedDB, every change is also recorded in an `outbox` table. Auth screens, migrations, RLS
tests and sync are built once the project URL is available.
**Consequences:** Nothing is lost later: the outbox already lists every changed row to upload on
first login. Until then data exists on one device only (export is available under Ik).

## ADR-011 — Muscle mapping: curated list and automatic rules

**Context:** free-exercise-db only knows "shoulders"; SPEC asks for ±150 curated exercises.
**Decision:** `scripts/exercises/curated.mjs` maps 212 common exercises by hand (B2 table plus
the same logic). Other exercises map automatically; shoulders are split by name (rear/reverse/
face pull → rear delts; lateral/side/upright → side delts; otherwise front delts).
Doubtful cases: upright rows count side delts direct and traps indirect; dips count chest or
triceps as direct depending on the dataset variant; rows count upper back direct with lats,
rear delts and biceps indirect (as B2); Smith/machine variants follow their free-weight twin.
**Consequences:** Auto-mapped exercises show "Spieren automatisch ingedeeld" on their page.

## ADR-012 — Routines and workouts stored as documents

**Context:** SPEC §7.1 lists normalised tables (routine_exercises, workout_sets…).
**Decision:** Locally a routine and a workout are each one document with nested exercises and
sets. One row per routine/workout keeps offline edits atomic and last-write-wins sync simple.
**Consequences:** In Postgres they become `jsonb` columns with owner-only RLS. Statistics are
computed in `src/domain` from the documents (a few hundred workouts per year is trivial).
Revisit if buddy sharing needs per-set queries.

## ADR-013 — Intl instead of date-fns, own SVG charts instead of Recharts

**Decision:** Dates and numbers use the built-in `Intl` API with `nl-BE` and Europe/Brussels;
charts are a small own SVG component (`src/ui/charts/LineChart.tsx`).
**Consequences:** No extra dependencies, full control over the look; revisit if charts grow.

## ADR-014 — Reorder with up/down buttons

**Context:** SPEC asks for touch-friendly drag to reorder.
**Decision:** Up/down buttons first: reliable with sweaty thumbs and accessible. Drag can be
added later.

## ADR-015 — Profile editing reuses onboarding

**Decision:** "Profiel, doel en uitrusting" under Ik reopens `/welkom` with the current values
and returns to /ik. One form to maintain instead of two.

## ADR-016 — Service worker auto-update

**Context:** Stan's home-screen app kept showing an old cached version (404 on /design).
**Decision:** `registerType: 'autoUpdate'`, registered in `src/app/pwa.ts`, which also checks
for updates when the app comes back into view and every hour. All data is in IndexedDB, so the
automatic reload is safe, also mid-workout.
