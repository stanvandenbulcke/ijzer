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
