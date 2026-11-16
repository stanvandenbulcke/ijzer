# Plan — Fase 0: Fundament & setup

Doel: een leeg maar compleet project dat gebouwd, getest en gedeployed kan worden, en dat Stan
op zijn iPhone kan openen.

## A. Door Claude (klaar)

1. Spec naar `docs/SPEC.md`, `CLAUDE.md` en alle docs aanmaken.
2. Project scaffolden: Vite + React + TypeScript strict, Tailwind met eigen tokens, React Router.
3. Mappenstructuur uit §3.2 met een README per feature.
4. Kwaliteit: ESLint, Prettier, Vitest, Playwright op iPhone-formaat, secret-scan, CI-workflow.
5. PWA: manifest, service worker, tijdelijk icoon, self-hosted fonts.
6. Een tijdelijke startpagina die bewijst dat alles samenwerkt.

## B. Door Stan (nodig om verder te kunnen)

1. GitHub-account + lege privé-repo `ijzer`, en GitHub koppelen aan Claude.
2. Hosting-account (voorstel: Cloudflare) en de repo eraan koppelen.
3. Supabase-account met projecten `ijzer-dev` en `ijzer-prod`.
4. Beslissen: keep-alive tegen het pauzeren van Supabase, ja of nee.

## C. Daarna door Claude

1. Code pushen naar GitHub, CI groen.
2. Eerste deploy + controleren dat preview-URL's werken; security headers nakijken.
3. Stan test op iPhone (Safari → Deel → Zet op beginscherm).
4. Fase 0 afsluiten; plan voor Fase 1 (design system, /design-pagina, auth, onboarding).

## Afwijkingen van de spec (ter goedkeuring)

- TypeScript 6 i.p.v. 7, omdat ESLint versie 7 nog niet ondersteunt (ADR-002).
- Pakketten als Dexie, Supabase, Recharts worden pas geïnstalleerd in de fase die ze gebruikt (ADR-003).
- De installatie van Node/Git/VS Code op Windows is optioneel geworden, omdat Claude in de cloud bouwt (ADR-005).
