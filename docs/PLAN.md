# Plan — Fase 1: Design system, app-shell, landingspagina, auth, onboarding

Doel: na deze fase kan je een account maken, inloggen, de onboarding doorlopen en door de vijf
tabs navigeren. De tabs zelf zijn nog leeg (met een nette "komt in Fase X"-staat); de echte
inhoud (routines, workouts, voeding…) komt vanaf Fase 2.

Status: goedgekeurd op 2026-11-19. Blok A, B en D klaar. Op Stans vraag ("maak de volledige app")
is ook Fase 2, 3 en de kern van 4 en 6 gebouwd in lokale modus. Blok C (Supabase) wacht op de
Project URL. Zie PROGRESS.md.

## Blok A — Design system (geen Supabase nodig)

1. Tokens afwerken: contrastcontrole (WCAG AA) voor elk tekst/achtergrond-paar, spiergroepkleuren.
2. Eén iconenset kiezen: **Lucide** (dunne lijnen, open-source).
3. Basiscomponenten in `src/ui/`: Button, IconButton, TextField, NumberPad (eigen keypad),
   Stepper, Sheet (onderaan uitschuivend paneel), SegmentedControl (sub-tabs), Chip, Toast met
   "Ongedaan maken", ProgressRing, EmptyState, ListRow met hairlines.
4. App-gevoel op iPhone: geen per ongeluk geselecteerde tekst bij tikken, geen zoom bij
   invoervelden, safe areas (notch, home-balk), tikdoelen ≥ 44 px.
5. **/design-pagina** met alle tokens en componenten, in donker en licht.
   Tijdelijk ook online bereikbaar, zodat je hem op je iPhone kan bekijken; na goedkeuring
   alleen nog in dev.

**STOP: jij keurt de stijl goed op /design voordat ik verder bouw.**

## Blok B — App-shell en landingspagina

1. Onderste tabbalk: Vandaag · Train · Voeding · Progressie · Ik, met lege maar ontworpen schermen.
2. Echte landingspagina (§4.1): grote typografische hero, geanimeerde SVG-halter met schuivende
   schijven, echte app-schermen met demodata, knoppen **Account maken** en **Inloggen**,
   beginscherm-uitleg. Al ingelogd → meteen naar Vandaag.

## Blok C — Supabase en accounts

1. Projecten `ijzer-dev` en `ijzer-prod` koppelen. De app krijgt alleen de publieke sleutel.
2. Eerste migratie: tabel `profiles` met RLS (alleen de eigenaar).
3. **RLS-tests**: twee testgebruikers; bewijzen dat B niets van A kan lezen of wijzigen.
4. Registreren en wachtwoord vergeten via een **6-cijferige code** in de app (geen links: een
   link opent in Safari en niet in je beginscherm-app). Lange sessie, zelden opnieuw inloggen.
5. Beveiliging: Content-Security-Policy met de Supabase-adressen, secret-scan blijft in CI.
6. Keep-alive: een gratis GitHub Action die om de paar dagen een lichte request doet, zodat
   Supabase niet in slaap valt.

## Blok D — Onboarding (`/welkom`)

Stap voor stap, overslaanbaar en later aanpasbaar: naam, geboortejaar, geslacht, lengte,
gewicht → doel en tempo → activiteit en stappendoel → gym-uitrusting (stang, schijven,
dumbbell-stappen) → trainingsdagen per week → beginscherm-uitleg. Opgeslagen in `profiles`.

## Blok E — Afronden

- E2E-test: registreren → code invoeren → onboarding → tabs.
- Screenshots 390×844 en 430×932, donker en licht, zelf bekeken.
- Security-review en design-review door aparte subagents.
- Docs bijwerken, deployen, testinstructies voor jou.

## Nieuwe pakketten in deze fase

`@supabase/supabase-js`, `zod`, `react-hook-form`, `@radix-ui/react-dialog` (toegankelijke
sheets, volledig zelf gestyled), `lucide-react`, `motion`, `@tanstack/react-query`, `date-fns`.

## Wat ik van jou nodig heb

1. Supabase-account met de twee projecten (stappen volgen in de chat).
2. Goedkeuring van de stijl op /design (na blok A).
3. Is "IJZER" goed als naam? (Mag ook later, in Fase 9.)
