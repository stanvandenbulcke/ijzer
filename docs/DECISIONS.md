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
