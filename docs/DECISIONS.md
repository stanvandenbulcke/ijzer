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

## ADR-017 — Accounts: instant sign-up, password reset by link

**Context:** SPEC §4.1 asks for a 6-digit e-mail code for password reset. On the free plan the
built-in Supabase mailer cannot use custom templates (so no `{{ .Token }}` code) and only sends
to members of the Supabase organisation.
**Decision:** Sign-up needs no confirmation mail (`mailer_autoconfirm`), so anyone can create an
account. Password reset uses the default link with the `implicit` auth flow: the link opens in
Safari, the new password is set on `/nieuw-wachtwoord`, then you log in with it in the
home-screen app. Logging in itself is always e-mail + password in the app (no magic links).
**Consequences:** Reset mails only reach organisation members (Stan) until a free SMTP service
(e.g. Brevo or Resend free tier) is connected; then the 6-digit code can be switched on.

## ADR-018 — Sync: outbox push, server-clock pull, last write wins

**Decision:** Every local change is in the outbox; a sync round upserts those rows, then pulls
rows with `server_updated_at` (server clock) after the last cursor. A trigger refuses to
overwrite a newer row with an older one. Local data is tied to one account (`meta.ownerId`);
data made without an account is only moved into an account after an explicit choice, data of
another account is removed from the device, and signing out clears the device.

## ADR-019 — Motion for animation (supersedes the "no Motion yet" part of ADR-008)

**Context:** Stan found the app boring: no animations, nothing that feels alive.
**Decision:** `motion` (Motion for React) for page transitions, the sliding tab indicator,
count-up numbers, staggered cards, the draggable 3D body (`MuscleMap3D`) and the full-screen PR
celebration. Small loops (set stamp, exercise icon flip, loading bar) stay plain CSS.
`MotionConfig reducedMotion="user"` follows the iPhone's "Beperk beweging".
**Consequences:** ±35 kB gzipped extra; every animation is short and never blocks input.

## ADR-020 — Exercise photos in a house style

**Context:** The dataset photos (red gym walls, early-2000s look) felt odd to Stan.
**Decision:** Photos are shown monochrome with a light plate-yellow tint, and list icons
alternate start/end photo as a tiny loop. No external videos/GIFs (SPEC §4.2 media rules).

## ADR-021 — Name: IRON; accounts live on ijzer-prod

**Context:** Stan found "IJZER" boring and chose "IRON" (English, short). He approved setting up
ijzer-prod on 2026-11-20.
**Decision:** `APP_NAME = 'IRON'` (manifest, title, texts). The repository, Supabase projects
and internal identifiers keep the codename `ijzer`. The production build talks to ijzer-prod
(same migrations and RLS tests as dev); a GitHub Action calls `keep_alive()` every 3 days.

## ADR-022 — Lossless sync and sign-out (data-loss review)

**Context:** A review found ways to lose unsynced training data (sign-out wiped the outbox,
signing in with another account removed its changes, page boundaries could skip rows).
**Decision:** Nothing that is not in the cloud is removed without a second explicit
confirmation (sign-out sheet with "download a copy"; account switch screen). Sign-out is
`scope: 'local'`. Pull pages on `(server_updated_at, id)` with a 5-minute overlap; the trigger
uses `clock_timestamp()` and keeps the newer edit; rows are limited to 256 KB. Push/pull run
per table in parallel; one failing table never blocks the others and keeps its outbox. A
`syncNow()` during a round gets the next round. Unit tests run push/pull on a fake client.

## ADR-023 — Food diary first, external food data later

**Context:** Open Food Facts needs a contact address in the User-Agent (Stan's choice), NEVO
must be downloaded by Stan, label reading needs a Gemini key.
**Decision:** Ship the diary now with own products (values from the label, typed once), quick
add, portion sheet, targets (Mifflin-St Jeor, never below BMR, max 1 %/week loss) and week
overview. Logs store a per-100 g snapshot. Tables `foods`, `food_logs`, `nutrition_days` follow
the same document + RLS pattern. A project can list `notMigrated` tables: they are not synced
and their outbox waits, and the status says "voeding staat voorlopig alleen op dit toestel".

## ADR-024 — Progress photos stay on the device

**Context:** Stan asked for a timelapse "op het toestel"; body photos are the most sensitive
data in the app.
**Decision:** Photos are downscaled JPEGs in IndexedDB (`photos`), never synced or exported.
Sign-out does not remove them; "Alles wissen" does. The e2e test asserts no request leaves the
device while adding photos.

## ADR-025 — Barcodes via an edge function and a shared cache

**Context:** Open Food Facts asks for a User-Agent with a contact address; browsers cannot set
one. Stan chose his own address (2026-11-20).
**Decision:** Edge function `food-lookup` (JWT checked inside, CORS limited to the app) looks
in `product_cache`, else calls OFF API v2 with `IRON/1.0 (<OFF_CONTACT>)`; the address is a
Supabase secret, never in the repo or bundle. Found products are cached 30 days, misses 1 day;
200 lookups per user per day (`lookup_usage`, written only by the function). Users can read the
cache but never write it (RLS tests). In the app a scan first checks own products; OFF results
open an editable form before anything is saved. Scanner: ZXing (Apache-2.0/MIT), lazy-loaded;
the camera image never leaves the phone.

## ADR-026 — Samen trainen: one-time codes, private Realtime pair channels

**Context:** Stan wants to train "together" with his girlfriend; he chose that the other may see
exercise, kg and reps live (2026-11-20).
**Decision:** Linking with a 6-character one-time code (24 h, one open code per user, max 20
tries a day) through security-definer RPCs; `buddy_links` holds both directions, readable only
by their owner. Live data goes over a private Realtime broadcast channel `pair:<id>:<id>` whose
policies on `realtime.messages` allow only the two linked accounts. Nothing of one account is
stored for the other. The snapshot holds only ticked sets (skipped = marked, never zeros); a
"Deel mijn training live" switch turns sending off. Server features that are not deployed in a
project are hidden (`notDeployed` in `src/data/supabase/config.ts`) instead of failing.
**Security review (same day):** product cache no longer readable by users (it revealed what
others scanned); 8-character uniform codes, claimed atomically; anonymous users refused;
unlinking broadcasts `unlinked` so open channels stop at once; received snapshots are
validated (`liveParse.ts`) and live UI sits in an error boundary; the share switch is in the
synced profile; implausible OFF values count as missing, 7-day cache, broken answers not
cached. Tests cover Realtime policies, expired codes, anon access, function grants and that
every public table has forced RLS.
