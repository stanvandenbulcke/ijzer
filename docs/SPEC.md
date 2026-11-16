# SUPERPROMPT — Fitnessapp "IJZER" (werktitel)

> **Voor Stan:** zet dit bestand in een lege projectmap (bv. `C:\Users\<jij>\Projecten\ijzer\`), open Claude Code in die map en typ:
> `Lees SUPERPROMPT.md volledig. Begin met Fase 0 in plan mode.`
> Alles hieronder is voor Claude Code geschreven.

---

## 0. Rol, context en hoe je werkt

Je bent de lead engineer én product designer van deze app. Je bouwt hem samen met **Stan**: 19 jaar, Belgisch (Vlaams, Nederlandstalig), student, traint regelmatig in de gym. **Stan is een beginner in programmeren.** Hij wil leren, maar vooral een app die werkt en die hij elke dag in de gym gebruikt.

### 0.1 Harde randvoorwaarden (niet onderhandelbaar)

| Randvoorwaarde | Gevolg |
|---|---|
| Stan heeft een **iPhone** | De app moet perfect werken in iOS Safari en als web-app op het beginscherm. |
| Stan ontwikkelt op een **Windows-laptop** (soms instabiel: wifi valt weg) | Geen Mac-only tooling. Commands in PowerShell (of Git Bash). Push vaak naar GitHub zodat er nooit werk verloren gaat. |
| **Alles moet gratis** | Geen betaalde diensten, geen Apple Developer-account (€99/j), geen betaalde API's. Alleen gratis tiers. |
| **Accounts + cloud** | Elke gebruiker heeft een eigen account. Stans vriendin gebruikt de app op haar eigen iPhone met haar eigen account. Data van de een is onzichtbaar voor de ander, tenzij ze bewust iets delen. |
| **Stan stelt zijn workouts zelf samen** | Geen voorgeprogrammeerde schema's opdringen. Een krachtige routine-builder is de kern. (Voorbeeldtemplates mogen, maar zijn optioneel.) |
| **Origineel uiterlijk** | Geen kopie van Hevy, Strong, MyFitnessPal of MacroFactor, en geen generieke "AI-look" (zie §6). |
| **Taal** | UI in het Nederlands (Vlaams-vriendelijk, informeel "je"). Code, variabelen, commits en comments in het Engels. Oefeningnamen in het Engels (zo zegt men het in de gym). i18n-structuur voorzien zodat Engels later makkelijk kan. |

### 0.2 Waarom een PWA en geen native app (al beslist, niet heropenen zonder reden)

Onderzocht in november 2026:
- Expo Go in de Apple App Store stopt bij SDK 54; nieuwere SDK's vereisen eigen builds via TestFlight, en dat vereist een betaald Apple Developer-account. Een development build zonder betaald account installeren kan alleen door lokaal te compileren op een **Mac** met Xcode. Stan heeft geen Mac en wil niet betalen → native valt af.
- Een **Progressive Web App** (PWA) die Stan via Safari → Delen → "Zet op beginscherm" installeert, draait schermvullend als app, werkt offline, krijgt een eigen icoon, kan de camera gebruiken (barcode/label scannen), en ondersteunt push-meldingen op iOS 16.4+ (alleen als hij op het beginscherm staat). Sinds iOS 26 openen sites die op het beginscherm gezet worden standaard als web-app.
- Een PWA is gratis te hosten, werkt meteen ook op de iPhone van zijn vriendin (gewoon een link), en is later nog in een native wrapper (Capacitor) te steken als Stan ooit wél wil betalen.
- **Beperking die we bewust oplossen:** een PWA kan Apple Health (stappen) niet rechtstreeks lezen. Oplossing: een iOS **Opdrachten/Shortcuts**-automatisering die stappen uit Apple Health naar onze backend stuurt (zie §4.7). Dit is een bekend en werkend patroon.

### 0.3 Je werkwijze (verplicht)

1. **Lees eerst dit hele document.** Kopieer het daarna ongewijzigd naar `docs/SPEC.md` (bron van waarheid).
2. Maak een `CLAUDE.md` in de root (max ±150 regels): de belangrijkste regels uit dit document, de mappenstructuur ("waar staat wat"), de commando's (dev, test, lint, build, deploy, migrations) en de Definition of Done. Houd hem actueel. CLAUDE.md wordt bij elke sessie automatisch gelezen; SPEC.md lees je opnieuw aan het begin van elke fase.
3. Werk **fase per fase** (§9). Begin elke fase in **plan mode**: maak/actualiseer `docs/PLAN.md` met concrete taken, laat Stan het plan goedkeuren, implementeer dan.
4. **Stop na elke fase.** Geef Stan in kort, eenvoudig Nederlands: (a) wat er nu werkt, (b) hoe hij het op zijn iPhone test (exacte stappen), (c) wat hij eventueel zelf moet doen, (d) één ding dat hij hieruit kan leren over programmeren (max 3 zinnen). Wacht op zijn feedback.
5. Houd `docs/PROGRESS.md` bij (afgevinkte taken, open punten, bekende bugs) zodat een nieuwe sessie na `/clear` meteen verder kan.
6. Leg architectuurkeuzes vast in `docs/DECISIONS.md` (korte ADR's: context → beslissing → gevolgen).
7. **Nooit "klaar" zeggen zonder bewijs:** typecheck, lint, unit tests, build en (vanaf Fase 1) Playwright-screenshots op iPhone-formaat (390×844 en 430×932) moeten slagen en je hebt de screenshots zelf bekeken.
8. **Git-discipline:** `.gitignore` (incl. `.env*`) vóór de eerste commit. Kleine commits met duidelijke Engelse messages. Push naar GitHub minstens aan het eind van elke taakgroep.
9. **Vraag Stan alleen wat jij niet kunt doen of beslissen:** accounts aanmaken (GitHub, Supabase, hosting, Google AI Studio), een bestand downloaden, iets testen op zijn iPhone, persoonlijke voorkeuren. Leg zulke stappen uit als genummerde klik-voor-klik instructies. Eén ding tegelijk.
10. **Gebruik subagents** voor onafhankelijke reviews aan het eind van elke fase: een *security reviewer* (RLS, secrets, auth) en een *design reviewer* (§6-anti-patronen, toegankelijkheid). Als de officiële `frontend-design` skill/plugin beschikbaar is, gebruik die bij UI-werk.
11. **Check actuele documentatie** voor alles wat snel verandert (Supabase CLI, Gemini-modelnamen/limieten, Open Food Facts API, hostingplatform, Vite/React-versies). Vertrouw niet blind op je trainingsdata.
12. Voeg **geen** betaalde diensten, trackers, analytics of advertenties toe.

---

## 1. Productvisie

**IJZER** (werktitel; staat in één constante `APP_NAME` zodat Stan het makkelijk kan wijzigen) is een all-round fitnessapp met **gymprogressie als hart**, aangevuld met voeding (calorieën + macro's, barcode- en labelscan), lichaamsgewicht, stappen en een ingebouwde wetenschappelijke coach.

**Kernbelofte:** "Log je training in seconden, zie precies of je sterker wordt, en begrijp waarom."

Ontwerpprincipes:
1. **Gym-first:** alles wat je tijdens een training doet moet werken met één hand, bezwete vingers, slechte gsm-ontvangst (kelder-gyms) en tussen sets door.
2. **Snelheid boven features:** een set loggen = maximaal 2 tikken als je hetzelfde doet als vorige keer.
3. **Data die eerlijk is:** overgeslagen oefeningen zijn géén nullen; schattingen worden als schatting getoond; elke tip heeft een "Waarom?".
4. **Rustig en duidelijk:** geen drukte, geen schuldgevoel, geen dark patterns.
5. **Privé standaard:** niets wordt gedeeld tenzij de gebruiker dat expliciet aanzet.

---

## 2. Tech stack

| Laag | Keuze | Opmerking |
|---|---|---|
| Frontend | **Vite + React + TypeScript (strict)** | Recentste stabiele versies (check docs). |
| Routing | React Router (data routers) | Routes spiegelen de app-tabs (§3). |
| Styling | Tailwind CSS **met eigen design tokens** (§6) | Het standaardpalet en standaard shadcn-thema zijn verboden als look. Radix UI primitives mogen voor toegankelijke dialogs/sheets/popovers, maar volledig zelf gestyled. |
| Lokale database | **Dexie (IndexedDB)** | Offline-first: actieve workout en logs worden eerst lokaal opgeslagen. |
| Server state | TanStack Query | Caching/sync met Supabase. |
| UI state | Zustand | Klein houden. |
| Formulieren/validatie | react-hook-form + **zod** | Zod-schema's gedeeld tussen client en edge functions waar mogelijk. |
| Grafieken | Recharts (of visx als nodig) | Volledig gestyled met eigen tokens. |
| Animatie | Motion (framer-motion) | Respecteer `prefers-reduced-motion`. |
| Datums | date-fns met `nl-BE` locale | Tijdzone Europe/Brussels. |
| PWA | vite-plugin-pwa (Workbox) | Manifest, icons, offline cache, update-melding. |
| Backend | **Supabase (gratis tier)** | Auth, Postgres + **Row Level Security**, Storage (privé bucket voor progressiefoto's), Edge Functions. |
| Hosting | Cloudflare (Pages/Workers static assets) **of** Vercel Hobby | Kies wat op dat moment het eenvoudigst en gratis is; automatische deploy bij push naar GitHub + preview-URL's. HTTPS is verplicht (camera en service worker werken alleen via HTTPS). |
| Barcode | WebAssembly-scanner (bv. ZXing-wasm via een `BarcodeDetector`-polyfill) | Safari ondersteunt de native Barcode Detection API niet. Test expliciet in iOS-standalone modus. |
| Labelscan (OCR) | Interface `LabelReader` met 2 implementaties: (1) **Gemini (gratis tier)** via Edge Function, (2) **Tesseract.js** on-device fallback | Zie §4.5. |
| Tests | Vitest (unit), Playwright (e2e, iPhone-viewport, screenshots) | Domeinlogica = 100% getest. |
| Kwaliteit | ESLint, Prettier, `tsc --noEmit`, Husky/lint-staged optioneel | |
| Fonts | Self-hosted via @fontsource (offline) | Zie §6. |

**Supabase-projecten:** maak er twee aan (gratis tier laat 2 actieve projecten toe): `ijzer-dev` en `ijzer-prod`. Migraties als SQL-bestanden in `supabase/migrations/`, toegepast met de Supabase CLI (`supabase link` + `supabase db push`). Docker is op Stans laptop niet gewenst: gebruik geen `supabase start`. Als een CLI-commando Docker vereist, zoek het alternatief (bv. functions deployen zonder Docker, check docs) of gebruik het dashboard.

**Let op gratis-tier gedrag:** Supabase pauzeert gratis projecten na 7 dagen zonder activiteit (data blijft bewaard, manueel hervatten). Door de offline-first opzet blijft de app bruikbaar; toon een duidelijke melding als de server niet bereikbaar is. Vraag Stan of hij een optionele keep-alive (GitHub Action die om de paar dagen een lichte request doet) wil.

---

## 3. Informatie-architectuur & codestructuur ("alles netjes in tabs")

### 3.1 App-navigatie (onderste tabbalk, max 5 tabs)

| Tab | Route | Inhoud |
|---|---|---|
| **Vandaag** | `/vandaag` | Dagoverzicht: training van vandaag, calorieën/eiwit over, stappen, gewichtstrend, streak, laatste PR, snelle acties. |
| **Train** | `/train` | Routines (templates), training starten, actieve workout, geschiedenis, oefeningenbibliotheek. |
| **Voeding** | `/voeding` | Dagboek per maaltijd, zoeken/scannen, mijn producten, maaltijden/recepten, doelen. |
| **Progressie** | `/progressie` | Sub-tabs: Overzicht · Oefeningen · Spiergroepen · Lichaam · Stappen · Analyse. |
| **Ik** | `/ik` | Profiel, doelen, instellingen, gym-uitrusting, Wetenschap-bibliotheek, buddies, export, credits/licenties, uitloggen. |

Publiek (niet ingelogd): `/` landingspagina, `/login`, `/registreren`, `/wachtwoord-vergeten`.
Na eerste login: `/welkom` onboarding.

### 3.2 Mappenstructuur (verplicht, feature-based = gespiegeld aan de tabs)

```
/
├─ CLAUDE.md                 ← regels + kaart van het project (altijd actueel)
├─ docs/
│  ├─ SPEC.md                ← dit document, ongewijzigd
│  ├─ PLAN.md                ← plan van de huidige fase
│  ├─ PROGRESS.md            ← voortgang/handoff
│  ├─ DECISIONS.md           ← ADR's
│  ├─ ARCHITECTURE.md        ← diagram + uitleg datastromen, sync
│  ├─ DATA_MODEL.md          ← tabellen, relaties, RLS-uitleg
│  ├─ DESIGN.md              ← design tokens, componenten, do/don't
│  ├─ SCIENCE.md             ← Bijlage A, uitgebreid met bronnen
│  └─ GIDS_VOOR_STAN.md      ← beginnersuitleg in het Nederlands (hoe start ik, test ik, deploy ik)
├─ src/
│  ├─ app/                   ← router, providers, app-shell, tabbalk, error boundaries
│  ├─ features/
│  │  ├─ landing/
│  │  ├─ auth/
│  │  ├─ onboarding/
│  │  ├─ today/              ← tab Vandaag
│  │  ├─ training/           ← tab Train
│  │  │  ├─ routines/
│  │  │  ├─ active-workout/
│  │  │  ├─ history/
│  │  │  └─ library/         ← oefeningenbibliotheek + eigen oefeningen
│  │  ├─ nutrition/          ← tab Voeding
│  │  │  ├─ diary/
│  │  │  ├─ search/
│  │  │  ├─ scan/            ← barcode + labelscan
│  │  │  ├─ foods/           ← mijn producten
│  │  │  ├─ meals/
│  │  │  └─ targets/
│  │  ├─ progress/           ← tab Progressie
│  │  │  ├─ overview/
│  │  │  ├─ exercises/
│  │  │  ├─ muscles/
│  │  │  ├─ body/
│  │  │  ├─ steps/
│  │  │  └─ analysis/
│  │  ├─ me/                 ← tab Ik (profiel, instellingen, uitrusting, export)
│  │  ├─ science/            ← Wetenschap-bibliotheek
│  │  └─ buddies/
│  ├─ domain/                ← PURE TypeScript-logica, geen React, 100% getest
│  │  ├─ strength/           ← e1RM, PR's, progressie-suggesties, warm-ups, plate calculator
│  │  ├─ volume/             ← fractional sets, spiergroep-volume
│  │  ├─ analysis/           ← regels (§5.3)
│  │  ├─ nutrition/          ← macro-berekening, portie-omrekening, labelparser
│  │  ├─ energy/             ← BMR, gewichtstrend, adaptieve TDEE
│  │  └─ steps/
│  ├─ data/                  ← Dexie-schema, Supabase-client, sync-engine, repositories
│  ├─ ui/                    ← design system: tokens, componenten (Button, Sheet, NumberPad, Stepper, Chart-wrappers, BodyMap…)
│  ├─ i18n/                  ← nl.ts (en later en.ts), typed keys
│  └─ assets/
├─ supabase/
│  ├─ migrations/
│  ├─ functions/             ← food-lookup, label-read, ingest-steps, (later) push
│  ├─ seed/                  ← seed-scripts (oefeningen, NEVO)
│  └─ tests/                 ← RLS-tests
├─ data/raw/                 ← NEVO-bestand (door Stan gedownload), niet in git als licentie dat vraagt
├─ scripts/                  ← import free-exercise-db, beeldoptimalisatie, NEVO-import
└─ tests/e2e/
```

Regels:
- Elke map in `features/` krijgt een korte `README.md` (5–10 regels): wat zit hier, belangrijkste bestanden, afhankelijkheden.
- Een feature importeert nooit rechtstreeks uit een andere feature; gedeelde dingen gaan naar `domain/`, `data/` of `ui/`.
- Bestanden klein houden (richtlijn < 300 regels). Componenten met duidelijke namen.
- Elke domeinfunctie heeft JSDoc met formule/bron.

---

## 4. Functionele specificatie

### 4.1 Landingspagina, auth en onboarding

**Landingspagina (`/`)** — het eerste wat je ziet als je de app opent zonder in te loggen.
- Moet aanvoelen als een merk, niet als een SaaS-template. Verboden: gecentreerde hero met gradient + drie feature-kaartjes eronder.
- Idee: grote typografische hero ("Elke rep telt." of beter, bedenk zelf) met een geanimeerde SVG van een halter waarop gewichtsschijven schuiven; daaronder echte app-schermen (gerenderd met demodata, geen screenshots-stockfoto's) die laten zien: een set loggen, een PR-grafiek, het voedingsdagboek, de spierkaart.
- Twee duidelijke knoppen: **Account maken** en **Inloggen**.
- Een sectie "Zet IJZER op je beginscherm" met de iOS-stappen (Safari → Deel-knop → Zet op beginscherm), want iOS heeft geen automatische installatieprompt.
- Als de gebruiker al ingelogd is: meteen door naar `/vandaag`.

**Auth (Supabase):**
- **E-mail + wachtwoord** als hoofdmethode. Wachtwoord vergeten via **e-mail OTP-code** (6 cijfers die je in de app intypt).
- **Geen magic links als login-methode.** Reden: een web-app op het iOS-beginscherm heeft aparte opslag van Safari; een magic link opent in Safari en logt dan Safari in, niet de beginscherm-app.
- Sessie blijft lang bewaard (refresh tokens); de gebruiker moet zelden opnieuw inloggen.
- Supabase' ingebouwde e-mailverzending heeft lage limieten; voor 2–10 gebruikers is dat oké. Documenteer in `GIDS_VOOR_STAN.md` hoe later een gratis SMTP-dienst gekoppeld kan worden.

**Onboarding (`/welkom`)**, stap voor stap, overslaanbaar en later aanpasbaar:
1. Naam/bijnaam, geboortejaar, geslacht (voor BMR-formule), lengte, huidig gewicht, eenheid (kg standaard).
2. Doel: afvallen (cut) / onderhouden / aankomen (bulk) + gewenst tempo (zie §5.5, met begrenzing).
3. Activiteitsniveau buiten de gym + stappendoel (standaard 8.000).
4. Gym-uitrusting: halterstang (20 kg standaard), beschikbare schijven, stappen van dumbbells (bv. 2 of 2,5 kg), kleinste mogelijke gewichtsverhoging per toestel.
5. Trainingsdagen per week (alleen als richtlijn voor de weekstreak, geen verplicht schema).
6. "Zet op beginscherm"-uitleg (als de app nog in Safari draait: detecteer `display-mode: standalone`).
7. Optioneel: stappen-koppeling instellen (§4.7) — kan ook later.

### 4.2 Oefeningenbibliotheek

**Bron:** de open dataset **free-exercise-db** (github.com/yuhonas/free-exercise-db), vrijgegeven onder de **Unlicense** (publiek domein): 873 oefeningen in JSON met o.a. `name`, `force`, `level`, `mechanic`, `equipment`, `primaryMuscles`, `secondaryMuscles`, `instructions`, `category` en per oefening **2 foto's** (startpositie en eindpositie).

**Import (script in `scripts/`):**
- Download de dataset, converteer de afbeeldingen naar WebP (± 480 px breed, goede compressie) en host ze **zelf** (statische assets of Supabase Storage). Niet hotlinken naar GitHub.
- Seed de tabel `exercises` (globaal, read-only voor gebruikers).
- Map de spiergroepen van de dataset naar **onze taxonomie** (§Bijlage B). De dataset kent alleen "shoulders"; wij splitsen in voorste/zijkant/achterste delt. Cureer daarom handmatig minstens de **±150 meest gebruikte oefeningen** (bench, squat, rows, curls, raises, …) met een nauwkeurige spiermapping (gewicht 1 = direct, 0,5 = indirect) en een vlag `lengthened_emphasis`. De rest krijgt een automatische mapping met vlag `mapping_quality = 'auto'`.
- Bewaar de licentie-informatie in de app (Credits-pagina).

**Media-regels (heel belangrijk):**
- Gebruik **alleen** afbeeldingen uit free-exercise-db of eigen gemaakte SVG's.
- **Verboden:** GIF's/video's van ExerciseDB, MuscleWiki, YouTube-rips, Instagram, of welke beschermde bron ook.
- **"Mini-video"-effect zonder video:** toon de twee foto's als zachte flipbook-animatie (start ↔ eind, ±0,8 s per frame, crossfade, pauzeerbaar, respecteert reduced-motion). Dat geeft het gevoel van een klein filmpje.
- Extra knop **"Bekijk uitleg op YouTube"** die gewoon een YouTube-zoekopdracht opent (`https://www.youtube.com/results?search_query=<naam>+form`) in een nieuw venster. Niets embedden.

**Oefening-detailpagina:**
- Flipbook-media, naam, uitrusting, niveau, instructies (Engels uit de dataset; toon ze netjes genummerd).
- **Spierkaart** (voor- en achteraanzicht, eigen SVG) met primaire spieren fel en secundaire half-transparant.
- "Wetenschapsnotitie" als er een is (bv. overhead triceps extension → link naar het artikel over lange spierlengte).
- Jouw geschiedenis met deze oefening: beste set, e1RM-grafiek, laatste keer, notities.
- Alternatieven: oefeningen met dezelfde primaire spier en beschikbare uitrusting.

**Eigen oefeningen ("niche"-oefeningen die je zelf bedenkt):**
- Naam, type (gewicht × reps / lichaamsgewicht × reps / ondersteund (assisted) / tijd / afstand), unilateraal ja/nee, uitrusting, primaire + secundaire spieren (aan te tikken op de spierkaart), notities, optioneel een eigen foto (privé).
- Zonder foto: toon een gegenereerde visual = de spierkaart met de gekozen spieren gemarkeerd + initialen. Nooit een lege grijze placeholder.
- Eigen oefeningen tellen volledig mee in alle statistieken en analyses.

**Zoeken & filteren:** fuzzy search (ook op afkortingen als "rdl", "ohp", "bss"), filters op spiergroep, uitrusting, type; recent gebruikt bovenaan; favorieten.

### 4.3 Routines (zelf samenstellen) — de kern

Een **routine** = een template die Stan zelf bouwt, bv. "Chest Day", "Push A", "Benen zwaar".
- Naam, kleur/label, optionele map (bv. "Push/Pull/Legs").
- Geordende lijst oefeningen. Per oefening:
  - aantal sets, en per set: type (opwarming / werkset / dropset / tot falen), doel-reps (bereik, bv. 8–12), doel-RIR (bv. 1–2), optioneel doelgewicht;
  - rusttijd (standaard: compound 2–3 min, isolatie 1,5–2 min; aanpasbaar);
  - progressiemodel (§5.2), gewichtsverhoging;
  - notitie (bv. "stoel op stand 4");
  - **superset/circuit-groepering** (sleep twee oefeningen samen).
- Sleep om te herordenen (touch-vriendelijk), dupliceer routine, dupliceer oefening.
- Live preview tijdens het bouwen: **geschat volume per spiergroep** (fractional sets) van deze routine, met kleine spierkaart. Zo ziet Stan al bij het bouwen dat zijn chest day bv. 0 sets voor de achterste delts heeft.
- Optioneel: weekplanning (welke routine op welke dag) — alleen voor suggesties op "Vandaag", nooit verplicht.
- Optioneel: een paar voorbeeldroutines die Stan kan kopiëren (duidelijk als voorbeeld gelabeld).

### 4.4 Actieve workout — waar de app om draait

Starten vanuit een routine of leeg ("vrije training").

**Scherm per oefening (kaart-gebaseerd, verticaal scrollen of swipen tussen oefeningen):**
- Kop: oefeningnaam, kleine flipbook-thumbnail, spierchips, menu (…).
- Setrijen: `#` · type · **vorige keer** (spookwaarde, bv. "80 × 8 @2") · **gewicht** · **reps** · **RIR** (optioneel) · ✓-knop.
- **Snelle invoer:** tik op gewicht/reps → eigen grote numerieke keypad onderaan (geen iOS-toetsenbord) met knoppen −/+ (stapgrootte uit uitrustingsinstellingen), "zelfde als vorige set", "zelfde als vorige keer". Afvinken van een set met de vorige-keer-waarden = **1 tik**.
- Na ✓: **rusttimer start automatisch** (gebaseerd op timestamps, zodat hij klopt ook als het scherm uit was), grote aftelring bovenaan, +15 s / −15 s / overslaan. Bij einde: geluidje + visuele flits wanneer de app in beeld is. Gebruik de **Screen Wake Lock API** tijdens een workout (instelbaar) zodat het scherm niet uitgaat.
- **Progressie-hint** bovenaan elke oefening: "Doel vandaag: 82,5 kg × 8–10" met "Waarom?" (§5.2).
- **PR-detectie live:** zodra een set een record is → subtiele maar voldane animatie (bv. schijven die op een stang klikken) + PR-badge op de set.
- Plate calculator (tik op het gewicht → "per kant: 20 + 10 + 1,25") en opwarm-calculator voor de eerste compound.
- Notitie per set en per oefening; **pijn-vlag** met lichaamsdeel.

**Overslaan & flexibiliteit (expliciete wens van Stan):**
- Knop **"Overslaan"** per oefening, met optionele reden (machine bezet / tijd / pijn / geen zin / andere). Status wordt `skipped`.
- Knop **"Later doen"**: verplaatst de oefening naar het einde van de wachtrij (handig als een toestel bezet is).
- Knop **"Vervangen"**: kies een alternatief (dezelfde primaire spier, beschikbare uitrusting). De originele oefening krijgt status `substituted` met verwijzing naar de vervanger.
- Individuele sets die niet afgevinkt zijn, bestaan gewoon niet als prestatie (ze worden nooit als 0 opgeslagen).
- Training vroegtijdig beëindigen: resterende oefeningen worden automatisch `skipped`.
- **Regel voor alle statistieken:** overgeslagen of vervangen oefeningen en niet-afgevinkte sets tellen **nergens** mee: niet in grafieken, niet in volume, niet in PR's, niet in progressie-suggesties, niet in "vorige keer". In grafieken is zo'n dag een **gat**, nooit een dip naar nul. "Vorige keer" toont altijd de laatste keer dat de oefening écht werd uitgevoerd.

**Robuustheid (de #1 klacht bij fitnessapps is een kwijtgeraakte workout):**
- Elke wijziging wordt meteen in IndexedDB bewaard. App sluiten, gsm herstarten, geen netwerk: de workout staat er nog en loopt verder.
- Synchronisatie naar Supabase gebeurt op de achtergrond zodra er netwerk is (§7). Toon een discreet sync-icoontje.

**Na afloop — samenvatting:**
- Duur, aantal sets, totaal volume (tonnage), PR's, spieren geraakt (mini-spierkaart), vergelijking met de vorige keer dat deze routine gedaan werd, eventuele overgeslagen oefeningen.
- Gevoel/energie (1–5) en notitie.
- **Deelkaart:** genereer een mooie afbeelding (canvas → PNG, eigen design) en deel via de Web Share API (WhatsApp, Instagram-story…). Niets wordt automatisch gedeeld.
- Aanbod: "Routine bijwerken met wat je vandaag deed?" (bv. als hij een oefening verving).

### 4.5 Voeding: calorieën, macro's, barcode- en labelscan

**Dagboek (`/voeding`):**
- Bovenaan: kcal-ring (gegeten / doel / over) + balken voor eiwit, koolhydraten, vet (en optioneel vezels).
- Maaltijden: Ontbijt, Lunch, Avondeten, Snacks (namen en aantal aanpasbaar).
- Per item: naam, hoeveelheid, kcal, macro's. Swipe om te verwijderen (met "Ongedaan maken"-toast).
- Dag kopiëren / maaltijd van gisteren kopiëren.
- Vinkje **"Dag volledig gelogd"** (belangrijk voor de TDEE-berekening, §5.5).
- Weekoverzicht met gemiddelden en "eiwitdoel gehaald op X van 7 dagen".

**Iets toevoegen — 5 manieren:**
1. **Zoeken:** eerst in eigen producten + recent + favorieten, dan generieke voedingsmiddelen (NEVO, zie onder), dan Open Food Facts.
2. **Barcode scannen** met de camera.
3. **Label fotograferen** (voedingswaardetabel) als het product niet gevonden wordt of onvolledig is.
4. **Snel toevoegen:** alleen kcal + macro's typen (voor restaurant/schatting).
5. **Maaltijd/recept** toevoegen (eigen combinaties van producten).

**Barcodeflow:**
1. Scan → zoek eerst in de eigen database (`foods` + gedeelde productcache).
2. Niet gevonden → Edge Function `food-lookup` vraagt het op bij **Open Food Facts** (API v2, alleen de nodige velden). De function zet een **eigen User-Agent** (`IJZER/<versie> (<contact-e-mail van Stan>)` — vraag Stan welk e-mailadres) omdat Open Food Facts dat vereist en browsers geen User-Agent kunnen instellen. Respecteer de rate limits (15 leesrequests/min/IP volgens hun docs) en **cache** resultaten in een gedeelde tabel `product_cache` (barcode → genormaliseerde voedingswaarden per 100 g/ml + bronvermelding).
3. Gevonden → bevestigingsscherm (zie onder).
4. Niet gevonden of macro's ontbreken → aanbieden: "Fotografeer het etiket".

**Labelscan (OCR) — het etiket automatisch laten lezen en invullen:**
- Gebruiker fotografeert de voedingswaardetabel (optioneel ook de voorkant voor de naam).
- `LabelReader`-interface met:
  - **Primair: Gemini (gratis tier)** via Edge Function `label-read`. De API-sleutel staat alleen in Supabase secrets, nooit in de frontend. Vraag gestructureerde JSON-output (zod-schema): per 100 g/ml én per portie indien vermeld: energie (kJ en kcal), vet, waarvan verzadigd, koolhydraten, waarvan suikers, vezels, eiwitten, zout; portiegrootte; productnaam; betrouwbaarheid per veld. Kies het actuele gratis Flash-model (check de docs; namen en limieten veranderen, en Google heeft de gratis limieten eind 2025 sterk verlaagd). Rate-limit per gebruiker (bv. 25 scans/dag) en geef een nette fout als de gratis quota op is. Meld in de UI dat de foto naar Google gaat en dat gratis-tier-verzoeken door Google gebruikt kunnen worden om producten te verbeteren (alleen de etiketfoto, geen persoonsgegevens).
  - **Fallback: Tesseract.js on-device** + eigen parser in `domain/nutrition/labelParser.ts`. Gebruik het feit dat EU-etiketten (Verordening 1169/2011) een vaste volgorde hebben: energie, vetten, waarvan verzadigde vetzuren, koolhydraten, waarvan suikers, (vezels), eiwitten, zout. Herken NL, FR, DE en EN termen (Belgische verpakkingen zijn vaak meertalig: "Eiwitten / Protéines / Eiweiß / Protein"). Kies de kolom "per 100 g". Rond logisch af, herken kJ vs kcal, komma's als decimaalteken.
- **Altijd een bevestigingsscherm** met de uitgelezen waarden in bewerkbare velden, twijfelachtige velden geel gemarkeerd, en een sanity check (kcal ≈ 4·eiwit + 4·koolh + 9·vet (+2·vezels); waarschuw bij >15% afwijking).
- Na bevestigen: opslaan in **Mijn producten** (privé), gekoppeld aan de barcode, zodat het de volgende keer meteen gevonden wordt.

**Generieke voedingsmiddelen (banaan, rijst, kipfilet…):**
- Gebruik **NEVO** (Nederlands Voedingsstoffenbestand, RIVM): gratis te downloaden, ±2.300 voedingsmiddelen met Nederlandstalige namen, waarden per 100 g. Op data.overheid.nl staat de dataset onder **CC-BY 4.0**; RIVM vraagt een bronvermelding in de vorm "Gebaseerd op gegevens van NEVO-online versie 2025/9.0, RIVM, Bilthoven". Voor de download moet je akkoord gaan met hun voorwaarden → **vraag Stan om het bestand te downloaden** en in `data/raw/` te zetten; schrijf daarna een import-script. Toon de bronvermelding in de app (Credits + bij NEVO-producten).

**Hoeveelheid ingeven en aanpassen (expliciete wens: simpel maar duidelijk):**
- Eenheden: gram, ml, stuk (met gram per stuk), portie (uit OFF of eigen).
- **Portie-sheet** (bottom sheet) met: grote getalweergave, eigen numerieke keypad, stepper −10/−1/+1/+10, snelle chips (laatst gebruikte hoeveelheid, 1 portie, 50/100/150/200 g), live herberekening van kcal en macro's.
- De app **onthoudt per product de laatst gebruikte hoeveelheid** en stelt die standaard voor.
- Een gelogd item later aanpassen = tik → dezelfde sheet → hoeveelheid wijzigen → klaar. Altijd 1 tik terug met "Ongedaan maken".
- Bij elk log-item wordt een **snapshot** van de voedingswaarden per 100 g bewaard, zodat oude dagen niet veranderen als je een product later bewerkt.

**Mijn producten:** lijst met zoekfunctie; bewerken (naam, merk, waarden, standaardportie, gram per stuk), favoriet maken, verwijderen. OFF-productfoto's tonen met bronvermelding (Open Food Facts-data: ODbL; foto's: CC BY-SA).

**Maaltijden/recepten:** combineer producten met hoeveelheden; optioneel "recept voor X porties" → per portie loggen.

**Extra's (na de kern):** watertracker, **supplementen-checklist** (eigen lijst, dagelijks afvinken, bv. creatine), notities per dag.

### 4.6 Lichaam: gewicht, maten, foto's

- **Gewicht:** dagelijks wegen aanmoedigen (zonder te pushen), invoer met keypad. Grafiek toont ruwe punten (licht) + **trendlijn** (dik, §5.5). Weekverschil van de trend, niet van losse metingen. Tekst zoals "Trend: −0,6 kg/week (−0,5%)".
- **Maten:** taille, borst, heupen, armen, dijen, kuiten, nek (instelbaar), met grafiek per maat.
- **Progressiefoto's:** voor/zij/achter, opgeslagen in een **privé** Supabase Storage-bucket met RLS (alleen eigenaar, signed URL's), nooit gedeeld met buddies. Vergelijken met een schuifbalk (voor/na-slider) en datum-overlay. Optionele overlay-"ghost" van de vorige foto bij het nemen van een nieuwe, zodat de pose gelijk is.

### 4.7 Stappen (iPhone via Opdrachten/Shortcuts)

Een web-app kan Apple Health niet lezen. Oplossing:

1. In **Ik → Stappen koppelen** maakt de gebruiker een **persoonlijke stappen-token** aan (willekeurig, 1× getoond, kopieerknop; in de database alleen **gehasht** (SHA-256) bewaard; intrekbaar).
2. Edge Function `ingest-steps`: `POST` met header `Authorization: Bearer <token>` en een **platte-tekst body** met per regel `YYYY-MM-DD;aantal` (bewust platte tekst: JSON bouwen in Opdrachten is foutgevoelig). De function zoekt de gebruiker bij de token-hash, valideert, en doet een upsert in `daily_steps` (per gebruiker per datum: hoogste/laatste waarde). Rate-limit.
3. Een **stap-voor-stap gids in de app** (met schermafbeeldingen of duidelijke illustraties) om in de app Opdrachten een opdracht "IJZER stappen" te maken:
   - Actie **Zoek gezondheidsstalen** (Find Health Samples): type Stappen, startdatum in de afgelopen 7 dagen, groepeer per dag.
   - **Herhaal met elk**: tekst `[Begindatum in formaat yyyy-MM-dd];[Waarde]`.
   - **Combineer tekst** met nieuwe regels.
   - **Haal inhoud van URL op** (Get Contents of URL): methode POST, header Authorization, body = de tekst.
   - Optioneel als laatste actie: open de app-URL.
4. In Opdrachten → **Automatisering**: elke dag om bv. 21:30, "Voer onmiddellijk uit". (Let op: Gezondheidsdata is niet leesbaar terwijl de iPhone vergrendeld is; documenteer dat en kies een tijdstip waarop de gsm meestal ontgrendeld wordt, of combineer met een tweede trigger.)
5. In de app een knop **"Sync stappen nu"** die `shortcuts://run-shortcut?name=IJZER%20stappen` opent.
6. Fallback: **stappen handmatig ingeven**.
7. **Test dit samen met Stan op zijn iPhone** en pas de gids aan op wat hij echt ziet (iOS-versie, Nederlandstalige actienamen).

Weergave: vandaag (met "laatst gesynchroniseerd om …"), week/maand-grafiek, gemiddelde, doel, streak van doel gehaald.

### 4.8 Progressie (sub-tabs)

**Overzicht:**
- Kalender-heatmap van trainingen; trainingen per week vs. weekdoel.
- **Spierkaart (voor/achter) ingekleurd volgens fractional sets van de afgelopen 7 dagen** (te weinig / in doelzone / hoog / erg hoog — kleuren uit §6, met legenda en getallen bij tikken).
- Totaal volume per week, aantal PR's, recente PR-feed.

**Oefeningen (tik op een oefening → detail):**
- e1RM-grafiek over tijd (beste e1RM per sessie), beste set per sessie, volume per sessie.
- **Rep-PR-tabel:** beste gewicht voor 1, 2, 3 … 12+ reps.
- Geschiedenislijst van alle sessies met deze oefening (overgeslagen sessies staan er als grijze "overgeslagen"-rij, nooit als prestatie).
- Notities en pijn-vlaggen in de tijd.
- Periodeschakelaar: 4 weken / 3 maanden / 1 jaar / alles.

**Spiergroepen (tik op een spier → detail):**
- Fractional sets per week over tijd (lijn) met de doelzone als band.
- Welke oefeningen bijdragen (gestapelde staven).
- Frequentie per week, gemiddelde RIR als gelogd.
- Balansverhoudingen: duwen vs. trekken, quadriceps vs. hamstrings, voorste vs. achterste delt.

**Lichaam:** gewicht + trend, maten, foto's (§4.6), TDEE-grafiek (§5.5).

**Stappen:** zie §4.7.

**Analyse (de wetenschappelijke coach):** kaarten uit de regels in §5.3, gesorteerd op belang, elk met **"Waarom?"** dat linkt naar het juiste Wetenschap-artikel. Ook een **wekelijkse check-in** (bv. zondag): gewichtstrend, gemiddelde kcal en eiwit, stappen, trainingen, volume per spier, en voorgestelde aanpassingen op één scherm.

### 4.9 Vandaag (dashboard)

- Begroeting met naam en datum.
- Grote kaart "Training van vandaag" (uit weekplanning of laatst gedane routine) met **Start**-knop; of "Rustdag" met suggestie (wandelen → stappen).
- Calorieën over + eiwit over (met snelle "+ voeding"-knop en scanknop).
- Stappen vandaag, gewichtstrend-pijltje, weekstreak (bv. "3/4 trainingen deze week" — **streaks straffen rustdagen nooit**).
- Laatste PR, supplementen-checklist (als ingesteld).
- Alles tikbaar naar het juiste detailscherm.

### 4.10 Buddies (vriendin) & delen — later in de planning

- Elke gebruiker heeft een eigen account; standaard ziet niemand iets van een ander.
- **Buddy-koppeling** via uitnodigingscode; beide moeten accepteren; op elk moment te verbreken.
- Per gebruiker instelbaar wat buddies mogen zien: workout voltooid (ja/nee), PR's (ja/nee), stappen (ja/nee). **Nooit** gewicht, voeding of foto's, tenzij later expliciet toegevoegd.
- Een **routine delen** met een buddy (de buddy krijgt een kopie).
- Kleine vriendschappelijke weekuitdaging (bv. meeste stappen of trainingen), opt-in.
- Alles afgedwongen met RLS (§7.3), met tests die bewijzen dat een niet-buddy niets ziet.

### 4.11 Ik / instellingen

Profiel, doelen, eenheden (kg/lb; intern altijd kg), gym-uitrusting, rusttijd-standaarden, wake lock aan/uit, thema (donker standaard, licht optioneel), maaltijdnamen, stappendoel, stappen-token beheren, buddies, **data-export** (JSON + CSV per tabel), optionele **import van Strong/Hevy-CSV**, **account verwijderen** (verwijdert alle data, AVG/GDPR), Wetenschap-bibliotheek, Credits & licenties, app-versie, "Wat is er nieuw".

---

## 5. Domeinlogica (in `src/domain/`, puur en volledig getest)

### 5.1 Kracht & records

- **e1RM (geschat 1RM):** Epley: `e1RM = gewicht × (1 + reps/30)` voor reps 1–12 (bij 1 rep = gewicht). Boven 12 reps: geen e1RM tonen in de e1RM-grafiek (te onbetrouwbaar), wel als "beste set". Voor lichaamsgewicht-oefeningen: gebruik (lichaamsgewicht + extra gewicht) als het lichaamsgewicht bekend is, anders reps-PR's.
- **PR-types:** zwaarste gewicht, beste e1RM, meeste reps op een gegeven gewicht, rep-PR per aantal reps (1–12+), grootste setvolume, grootste sessievolume per oefening.
- Alleen **afgevinkte werksets** tellen (opwarmsets niet voor PR's).
- **Plate calculator:** greedy met de beschikbare schijven uit de uitrustingsinstellingen; meld als het exacte gewicht niet kan.
- **Opwarm-generator** (heuristiek): bv. stang × 10, 40% × 8, 60% × 5, 75% × 3, 85% × 1 voor zware compounds; korter voor isolatie.

### 5.2 Progressie-suggesties

Per oefening in een routine een progressiemodel:
- **Dubbele progressie (standaard):** rep-bereik [min, max] en doel-RIR. Als in de vorige sessie **alle** werksets het maximum aantal reps haalden bij ≤ doel-RIR → stel volgende keer het gewicht + kleinste stap voor (bv. +2,5 kg stang, +2 kg dumbbells) met reps terug naar het minimum. Anders: zelfde gewicht, probeer +1 rep op de zwakste set.
- **Vaste reps, gewicht omhoog** (bv. 5×5).
- **RIR-gestuurd:** gebruiker logt RIR; suggestie past het gewicht aan zodat de geplande RIR gehaald wordt (via e1RM-schatting).
- Elke suggestie heeft een korte uitleg ("Vorige keer haalde je 3×12 bij RIR 1 → tijd om zwaarder te gaan").
- **In een cut** (doel = afvallen): toon de boodschap dat **kracht behouden ook winst is**; stel minder agressieve progressie voor als prestaties dalen.

### 5.3 Analyse-regels (de "wetenschappelijke coach")

Elke regel is een pure functie: input = trainingsdata (+ voedingsdoel), output = `{ id, severity: 'info'|'tip'|'waarschuwing', titel, boodschap, waaromArtikelId, data }`. Drempels staan in één config-bestand, aanpasbaar in de instellingen. Elke regel heeft unit tests. Label heuristieken in de UI eerlijk als "vuistregel".

| ID | Regel | Standaard drempel | Basis |
|---|---|---|---|
| R1 | Volume per spiergroep (fractional sets, rollend 7 dagen én per kalenderweek) | < 6 laag · 6–9 matig · **10–20 doelzone** · 21–25 hoog · > 25 erg hoog (check herstel) | Pelland et al. 2026: meer volume = meer groei met afnemende meeropbrengst; banden zijn praktische vuistregels |
| R2 | Te veel sets voor één spier in één sessie | > 11–12 fractional sets/spier/sessie → tip: spreid over meer dagen | Remmert et al. 2025 (preprint) |
| R3 | Inspanning: gemiddelde gelogde RIR van werksets | gemiddeld > 4 RIR → tip om dichter bij falen (0–3 RIR) te trainen | Robinson et al. 2024 |
| R4 | Rusttijd (als de timer gebruikt wordt) | mediaan < 60 s bij compounds → tip | Singer et al. 2024 |
| R5 | Lange-spierlengte-dekking | spier wordt wekelijks getraind maar geen enkele oefening heeft `lengthened_emphasis` (vooral triceps, hamstrings, kuiten, biceps) → suggestie met concrete oefening | Maeo 2021/2023, Kinoshita 2023, Wolf 2023 |
| R6 | Balans | > 2:1 over 4 weken voor duwen/trekken, quads/hamstrings, voorste/achterste delt → tip | Vuistregel |
| R7 | Stagnatie per oefening | beste e1RM niet gestegen over de laatste 4 uitvoeringen (≥ 3 weken) → opties: rep-bereik wisselen, variant wisselen, deload, slaap/voeding checken; in een cut: "behoud is prima" | Vuistregel |
| R8 | Deload-signaal | ≥ 3 oefeningen tegelijk achteruit over 2 weken + hoog volume → stel een lichtere week voor | Vuistregel |
| R9 | Frequentie | spier 1×/week getraind met > 12 sets in die ene sessie → tip om te splitsen | Afgeleid van R2 |
| R10 | "Frisheid"-kaart | per spier: uren sinds laatst getraind × hoeveelheid sets → fris / herstellend / net getraind | **Expliciet een schatting**, geen meting |

**Fractional sets tellen:** per afgevinkte werkset: spieren met gewicht 1 (direct) +1, spieren met gewicht 0,5 (indirect) +0,5. Opwarmsets tellen niet. Overgeslagen/vervangen oefeningen tellen niet (de vervanger wel). Sets met gelogde RIR > 5 tellen standaard voor 0 (instelbaar), want die zijn te ver van falen om veel stimulus te geven.

### 5.4 Voeding

- Macro's per item = waarde per 100 × hoeveelheid / 100 (met gram-per-stuk/portie-omrekening).
- Doelen: kcal uit §5.5; **eiwit** standaard 1,6–2,2 g/kg lichaamsgewicht (standaard 2,0). Voor mensen met meer lichaamsvet kan de gebruiker eiwit baseren op **doelgewicht** of **vetvrije massa** (instelling) — leg uit in het Wetenschap-artikel. Vet standaard ≥ 0,6 g/kg of 20–30% van kcal; koolhydraten = rest. Alles aanpasbaar.
- Labelparser (§4.5) met uitgebreide unit tests op echte voorbeeldteksten (NL/FR/DE/EN, komma-decimalen, kJ/kcal-kolommen).

### 5.5 Energie: gewichtstrend & adaptieve TDEE

- **BMR:** Mifflin-St Jeor. **Start-TDEE** = BMR × activiteitsfactor.
- **Gewichtstrend:** exponentieel voortschrijdend gemiddelde met α = 0,1 per dag; bij gaten van Δ dagen: `trend = vorige + (1 − (1 − α)^Δ) × (gewicht − vorige)`.
- **Adaptieve TDEE** (MacroFactor-achtig principe, eigen implementatie): over een venster van 21 dagen (minimum 14 dagen data): `TDEE ≈ gemiddelde inname op volledig gelogde dagen − (trend_einde − trend_begin) × 7700 / aantal dagen`. Meng met de start-TDEE volgens datavolledigheid (`gewicht_data = min(1, volledige_dagen / 21)`). Beperk wijzigingen tot ±150 kcal per week. Toon een betrouwbaarheidsindicator.
- **Doel-kcal** = TDEE − tekort, waarbij tekort = gekozen tempo (% lichaamsgewicht/week) × trendgewicht × 7700 / 7.
- **Veiligheidsgrenzen:** afvaltempo max 1%/week instelbaar (standaard 0,5–0,75%); doel-kcal nooit onder de geschatte BMR; duidelijke disclaimer "geen medisch advies; bij twijfel: arts of diëtist". Geen extreme diëten voorstellen.
- Wekelijkse check-in stelt een nieuw doel voor; de gebruiker beslist.

---

## 6. Design: origineel, sterk, géén "AI-look"

### 6.1 Wat absoluut niet mag (bekende "AI slop"-kenmerken)

- Paarse/indigo gradients (de beruchte `from-purple-600 to-blue-600`), gradient-tekst, glow-schaduwen in dezelfde kleur.
- Inter, Roboto, Open Sans, Lato of het standaard systeemfont als merkfont.
- Gecentreerde hero met pill-badge erboven + drie feature-kaartjes met iconen.
- Onaangepast shadcn/Tailwind-standaardthema, `rounded-2xl` overal, zachte grijze schaduwen onder zwevende witte kaarten.
- Emoji's als iconen. Stockfoto's van fitte mensen.
- Glassmorphism zonder reden.
- Kopiëren van de UI van Hevy, Strong, MyFitnessPal, MacroFactor of Fitbod.

### 6.2 Designrichting: "Krijt & IJzer" (industriële gym, Olympische schijfkleuren)

- **Basis (donker thema, standaard):** warm grafiet, geen puur zwart. Voorstel tokens:
  `--bg #111110` · `--surface #1A1A18` · `--surface-2 #23231F` · `--line #2E2E29` · `--text #F2EFE6` (krijtwit) · `--text-muted #A8A496`.
- **Accent & semantiek = kleuren van Olympische bumper plates:** geel `#F2C14E` (15 kg) als primaire actiekleur (donkere tekst erop), rood `#D7263D` (25 kg) voor PR's en waarschuwingen, blauw `#2F6FDE` (20 kg) voor info/grafieken, groen `#2BA84A` (10 kg) voor "in doelzone/gelukt", wit (5 kg) voor neutrale highlights. Spiergroepen krijgen een vast, consistent kleurenschema afgeleid hiervan. Controleer contrast (WCAG AA) en pas tinten aan waar nodig.
- **Licht thema ("dag"):** papier `#F4F1E8`, inkt `#151513`, dezelfde accenten (aangepast voor contrast).
- **Typografie:** display/koppen en grote getallen in **Big Shoulders Display** (700–900, smal en industrieel); UI en tekst in **Archivo** (variabel). Beide open-source (OFL), self-hosted. Getallen altijd `tabular-nums`. Grote getallen zijn het visuele hoofdpersonage (gewicht, reps, kcal).
- **Vorm:** kleine radius (6–10 px), 1 px hairlines i.p.v. schaduwen, compacte maar ademende dichtheid. Een subtiel **knurling-patroon** (fijne diagonale arcering zoals de grip van een halterstang, 3–4% dekking) alleen op de header van de actieve workout en de landingspagina.
- **Iconen:** één consistente set (bv. Lucide of Phosphor), dunne lijnen, nooit gemixt.
- **Beweging:** 150–250 ms, ease-out, functioneel. Signature-momenten: set afvinken (korte "klik"-animatie), PR (schijven die op een stang schuiven), rusttimer-ring. Respecteer reduced-motion.
- **Spierkaart:** eigen gestileerde SVG (voor- en achteraanzicht), geen kopie van bestaande apps.
- **Ergonomie:** alles belangrijk binnen duimbereik onderaan; tikdoelen ≥ 44 px; safe areas (notch, home-indicator) gerespecteerd; geen hover-afhankelijke UI; tekst schaalbaar.
- **Lege staten en fouten** zijn ontworpen (illustratie + uitleg + actie), nooit kale "Geen data".
- Leg alles vast in `docs/DESIGN.md` en bouw eerst een **/design-pagina** (alleen in dev) met alle tokens en componenten, zodat Stan de stijl kan goedkeuren vóór de rest gebouwd wordt.

---

## 7. Data, sync en beveiliging

### 7.1 Datamodel (Postgres; uitwerken in `docs/DATA_MODEL.md`)

Alle tabellen: `id uuid` (client-side gegenereerd voor offline), `created_at`, `updated_at`, `deleted_at` (soft delete voor sync), en `user_id` waar van toepassing.

- `profiles` (1:1 met auth.users): naam, geboortejaar, geslacht, lengte, eenheden, doelen, uitrusting (jsonb), instellingen (jsonb).
- `muscles` (taxonomie, Bijlage B).
- `exercises`: globaal (`user_id null`, uit free-exercise-db) of eigen (`user_id`); naam, type, uitrusting, instructies, media-paden, `lengthened_emphasis`, `mapping_quality`, bron/licentie.
- `exercise_muscles`: exercise_id, muscle_id, weight (1 of 0,5).
- `routines`, `routine_exercises` (volgorde, superset-groep, rust, progressiemodel, notitie), `routine_sets` (type, rep-bereik, doel-RIR, doelgewicht).
- `workouts` (start, einde, routine_id, gevoel, notitie), `workout_exercises` (volgorde, `status: completed|skipped|substituted|in_progress`, skip_reason, substituted_by), `workout_sets` (type, gewicht_kg, reps, rir, `is_completed`, completed_at, notitie, pijn).
- `personal_records` (afgeleid; of berekend on the fly met caching).
- `foods` (eigen producten, privé), `product_cache` (gedeeld, OFF-resultaten), `generic_foods` (NEVO), `food_logs` (datum, maaltijd, food-referentie, hoeveelheid, eenheid, **snapshot per 100 g**), `meals` + `meal_items`, `day_status` (volledig gelogd ja/nee, water, notitie), `supplements` + `supplement_logs`.
- `body_weights`, `body_measurements`, `progress_photos` (pad in privé bucket).
- `daily_steps`, `step_tokens` (hash, label, laatst gebruikt, ingetrokken).
- `buddy_links` (twee user_ids, status, deelinstellingen), `shared_routines`.
- `label_scan_usage` (voor rate limiting).

### 7.2 Offline-first sync

- Dexie spiegelt de tabellen die de gebruiker nodig heeft + een **outbox** met wijzigingen.
- Schrijven = eerst lokaal (UI meteen bijgewerkt), dan outbox. Sync bij netwerkherstel, bij focus van de app en periodiek wanneer open.
- Conflicten: last-write-wins op `updated_at` per rij (één eigenaar per rij → zeldzaam).
- Vraag `navigator.storage.persist()` aan. De cloud is de bron van waarheid; lokaal is cache + outbox.
- Een duidelijke sync-status ("Alles opgeslagen" / "Wacht op netwerk" / "Fout — tik om opnieuw te proberen").
- Tests voor de sync-engine (offline loggen → online → server klopt; dubbele sync = geen duplicaten).

### 7.3 Beveiliging (de meest voorkomende fout bij AI-gebouwde apps)

Onderzoeken en audits van duizenden "vibe-coded" apps tonen keer op keer dezelfde lekken: tabellen zonder Row Level Security, een uitgelekte `service_role`-sleutel in de frontend, en te ruime policies. Daarom:

- **RLS staat aan op ELKE tabel**, ook nieuwe. Standaard: alleen de eigenaar mag lezen/schrijven. Globale tabellen (`exercises` zonder user_id, `muscles`, `generic_foods`, `product_cache`): alleen lezen voor ingelogde gebruikers; schrijven alleen via edge functions/server.
- **Schakel RLS nooit uit om een fout "op te lossen".** Los de policy op.
- Pas op met views (die kunnen RLS omzeilen): gebruik `security_invoker` of vermijd ze.
- De `service_role`-sleutel en de Gemini-sleutel staan **alleen** in Supabase secrets/edge functions. In de frontend enkel de publishable/anon key. Na elke build: zoek in de output naar geheime sleutels (script in CI).
- Edge functions controleren de JWT (behalve `ingest-steps`, die de stappen-token-hash controleert) en valideren input met zod. Rate limiting op label-read en ingest-steps.
- Storage-bucket voor foto's is privé met policies per gebruiker; alleen signed URL's met korte geldigheid.
- **RLS-tests** in `supabase/tests/`: maak 2 testgebruikers (A en B) in het dev-project en bewijs dat B niets van A kan lezen of wijzigen, en dat buddy-deling alleen toont wat ingesteld is. Deze tests moeten groen zijn voor elke release.
- Security headers (CSP, etc.) via het hostingplatform.
- Geen persoonsgegevens in logs.

---

## 8. Kwaliteit & Definition of Done (per taak en per fase)

- [ ] `tsc` zonder fouten, ESLint schoon, unit tests groen, build slaagt.
- [ ] Domeinlogica heeft unit tests (incl. randgevallen: lege data, overgeslagen oefeningen, eenheden, tijdzones/middernacht).
- [ ] Playwright e2e voor de kernflows (registreren → onboarding → routine maken → workout loggen met overslaan → samenvatting; product scannen (gemockt) → loggen → hoeveelheid aanpassen).
- [ ] Screenshots op 390×844 en 430×932 in donker én licht thema bekeken; geen §6.1-anti-patronen.
- [ ] Toegankelijkheid: contrast AA, labels voor schermlezers, focus-volgorde, 44 px tikdoelen.
- [ ] Performance: snelle eerste load op 4G, Lighthouse PWA-checks groen, lazy loading van zware delen (Tesseract, grafieken).
- [ ] RLS-tests groen; geen secrets in de bundle.
- [ ] `PROGRESS.md`, `CLAUDE.md` en relevante docs bijgewerkt; gecommit en gepusht.
- [ ] Korte Nederlandstalige samenvatting + testinstructies voor Stan.

---

## 9. Fasering

Bouw in deze volgorde. Elke fase eindigt met een werkende, gedeployde versie die Stan op zijn iPhone kan openen.

**Fase 0 — Fundament & setup (samen met Stan)**
- Controleer/installeer (met uitleg voor Stan): Node.js LTS, Git for Windows, een editor (VS Code), Supabase CLI. Laat versies zien.
- Laat Stan accounts aanmaken (stap voor stap): GitHub, Supabase (projecten `ijzer-dev` en `ijzer-prod`), hosting (Cloudflare of Vercel). Google AI Studio-sleutel pas in Fase 5.
- Scaffold het project volgens §2–3, CLAUDE.md, docs/, linting, tests, PWA-manifest + tijdelijk icoon, eerste deploy met automatische preview-URL's.
- **Testmethode op de iPhone:** open de gedeployde (HTTPS) preview-URL in Safari en zet hem op het beginscherm. (De lokale dev-server via wifi werkt voor snelle UI-checks, maar camera en service worker vereisen HTTPS.)
- Schrijf `docs/GIDS_VOOR_STAN.md`.
- Stel de open vragen uit §11 die nu al nodig zijn.

**Fase 1 — Design system, app-shell, landingspagina, auth, onboarding**
- Tokens, fonts, componenten, /design-pagina → **Stan keurt de stijl goed** voor je verdergaat.
- Tabbalk + lege tab-schermen, landingspagina, registreren/inloggen/wachtwoord-reset (OTP), onboarding, profiel in de database met RLS + RLS-tests.

**Fase 2 — Oefeningenbibliotheek**
- Import free-exercise-db (WebP, zelf gehost), spiertaxonomie, gecureerde mapping voor de top ±150, zoeken/filteren, detailpagina met flipbook en spierkaart, eigen oefeningen.

**Fase 3 — Routines & actieve workout (het hart)**
- Routine-builder met live volume-preview, actieve workout met keypad, vorige-keer-waarden, rusttimer, wake lock, overslaan/later/vervangen, PR-detectie, plate calculator, samenvatting + deelkaart, offline-first opslag en sync.

**Fase 4 — Progressie & analyse**
- Geschiedenis, oefening-detail met grafieken en rep-PR's, spiergroep-detail, spierkaart-heatmap, analyse-regels R1–R10, Wetenschap-bibliotheek (uit Bijlage A).

**Fase 5 — Voeding**
- NEVO-import (Stan downloadt het bestand), zoeken, Edge Function `food-lookup` (OFF + cache), barcode scannen, `label-read` (Gemini) + Tesseract-fallback, bevestigingsscherm, portie-sheet, mijn producten, maaltijden, doelen, dag-volledig-vinkje, weekoverzicht.

**Fase 6 — Lichaam & energie**
- Gewicht + trend, maten, progressiefoto's (privé bucket), adaptieve TDEE, wekelijkse check-in.

**Fase 7 — Stappen**
- Stappen-token, `ingest-steps`, gids voor Opdrachten + automatisering, knop "Sync stappen nu", grafieken. **Samen met Stan testen.**

**Fase 8 — Buddies, export/import, account verwijderen**
- Buddy-koppeling met RLS-tests, routine delen, weekuitdaging, export JSON/CSV, import Strong/Hevy-CSV, account verwijderen.

**Fase 9 — Afwerking**
- Supplementen-checklist, water, achievements (smaakvol, eigen SVG-badges, bv. eerste 100 kg bench), lege/foutstaten, performance, toegankelijkheid, laatste security-audit (subagent), "Wat is er nieuw"-scherm, definitieve app-icoon en naam (vraag Stan).

---

## 10. Wat je NIET doet

- Geen betaalde diensten of API's; geen proefperiodes die later betalend worden.
- Geen beschermde media (oefening-GIF's/video's van derden).
- Geen RLS uitschakelen, geen secrets in de frontend, geen `service_role` in de client.
- Geen medische claims, geen extreme diëten, geen afvaltempo's boven de veiligheidsgrens.
- Geen nul-waarden voor overgeslagen oefeningen of niet-afgevinkte sets.
- Geen grote "alles-in-één"-wijzigingen zonder tests; geen fase overslaan.
- Geen magic-link-login (iOS beginscherm-probleem).
- Geen tracking/analytics van derden.
- Niet zelf beslissen over iets wat Stans persoonlijke voorkeur is (naam, kleuren-goedkeuring, wat zijn vriendin mag zien) — vraag het.

---

## 11. Open vragen voor Stan (stel ze op het juiste moment, niet allemaal tegelijk)

1. Is "IJZER" goed als naam, of heb je een ander idee? (Fase 1/9)
2. Welke schijven en dumbbell-stappen heeft jouw gym? Welke toestellen gebruik je vaak? (Fase 1/3)
3. Welk e-mailadres mag als contact in de User-Agent voor Open Food Facts? (Fase 5)
4. Welke maaltijdnamen wil je? Wil je water- en supplementtracking? (Fase 5/9)
5. Wil je de optionele keep-alive tegen het pauzeren van Supabase? (Fase 0)
6. Wat mag je vriendin standaard zien als buddy? (Fase 8)
7. Heb je al trainingsgeschiedenis in een andere app (Strong/Hevy-export) om te importeren? (Fase 8)
8. Keur je de stijl op de /design-pagina goed? (Fase 1)

---

## Bijlage A — Wetenschappelijk kader (kopieer naar `docs/SCIENCE.md` en maak er korte in-app artikels van)

> Doel: de app geeft adviezen die gebaseerd zijn op de beste beschikbare evidentie, maar is eerlijk over onzekerheid. Schrijf de in-app artikels in eenvoudig Nederlands (±150–300 woorden elk), met een "In het kort"-zin, een "Wat doet de app hiermee"-alinea, en de bronnen onderaan. Onderscheid altijd **evidentie** (meta-analyses, gecontroleerde studies) van **vuistregels** (praktijk/heuristiek).

### A1. Trainingsvolume (aantal sets) — de sterkste knop voor spiergroei
- Volume is in overzichtsonderzoek de trainingsvariabele met de duidelijkste dosis-respons-relatie met spiergroei (umbrella review: Bernárdez-Vázquez et al. 2022).
- De grootste meta-regressie tot nu toe (Pelland, Remmert, Robinson, Hinson & Zourdos, *Sports Medicine* 2026; 67 studies, 2.058 deelnemers) vond een positief verband tussen wekelijkse sets en zowel spiergroei als kracht, met **afnemende meeropbrengst**. Voor spiergroei liep de curve geleidelijk af (meer sets blijven iets toevoegen); voor kracht vlakte ze veel sneller af.
- **Fractional sets:** sets waarbij een spier secundair meewerkt (bv. triceps bij bankdrukken) tellen voor de helft. Deze telmethode gaf in die analyse de best passende modellen. → De app telt volume zo (§5.3).
- **Per sessie:** een preprint van dezelfde groep (Remmert et al. 2025) suggereert dat er voor spiergroei per sessie weinig aantoonbare meerwaarde is boven ±11 fractional sets per spier → spreiden over meerdere dagen is slimmer dan alles in één keer.
- **Vuistregel in de app:** 10–20 fractional sets per spier per week als standaard-doelzone, aanpasbaar; meer kan, maar herstel en tijd worden de beperking.

### A2. Frequentie
- Bij gelijk weekvolume lijkt hoe vaak je een spier traint weinig uit te maken voor spiergroei; voor kracht helpt een hogere frequentie wel, met afnemende meeropbrengst (Pelland et al. 2026).
- **App:** frequentie is vooral een hulpmiddel om volume per sessie behapbaar te houden (zie R2/R9).

### A3. Hoe dicht bij falen (RIR = reps in reserve)
- Meta-regressie (Robinson et al., *Sports Medicine* 2024; 55 hypertrofie- en 67 krachtstudies): dichter bij falen trainen hangt samen met meer spiergroei, maar niet met meer krachtwinst. De onderzoekers stellen 0–5 RIR voor spiergroei voor en ±3–5 RIR voor kracht.
- Trainen tot volledig falen is niet nodig: een gecontroleerde studie bij getrainde personen vond vergelijkbare groei bij falen en bij 1–2 RIR, met meer vermoeidheid bij falen (Refalo et al. 2024).
- **App:** standaard doel-RIR 1–3 voor werksets; tip als de gelogde RIR structureel hoog is (R3).

### A4. Gewicht en rep-bereik
- Bij sets tot (of dicht bij) falen geven lichte en zware gewichten vergelijkbare spiergroei; zware gewichten geven meer maximale kracht (Schoenfeld et al., *JSCR* 2017, meta-analyse van 21 studies).
- **App:** elk rep-bereik van ±5 tot 30 is geldig voor groei; ±6–15 is meestal het meest tijdsefficiënt (vuistregel). Voor kracht: ook zware sets met weinig reps.

### A5. Rusttijd tussen sets
- Bayesiaanse meta-analyse (Singer et al., *Frontiers in Sports and Active Living* 2024): een klein voordeel voor rustpauzes langer dan 60 seconden, mogelijk omdat je dan meer volume (gewicht × reps) haalt. Het aantal studies is klein en vooral bij ongetrainde mannen, dus de onzekerheid is groot.
- **App:** standaard 2–3 min voor zware compounds, 1,5–2 min voor isolatie; tip als rust structureel < 60 s is (R4).

### A6. Bewegingsuitslag en training op lange spierlengte
- Volledige bewegingsuitslag is gemiddeld minstens zo goed als gedeeltelijke; partials in de **gerekte** positie ("lengthened partials") lijken beter dan partials in de verkorte positie (Wolf et al. 2023, meta-analyse). Het onderzoek is nog volop in ontwikkeling en niet alle studies zijn het eens.
- Concrete, sterkere voorbeelden waarbij dezelfde spier op langere lengte getraind werd:
  - **Triceps:** overhead extensions gaven duidelijk meer tricepsgroei dan pushdowns in neutrale armpositie, zelfs met lichtere gewichten (Maeo et al. 2023; hele triceps ±+20% vs. ±+14%).
  - **Hamstrings:** zittende leg curl > liggende leg curl (Maeo et al. 2021).
  - **Kuiten:** staande calf raise gaf veel meer gastrocnemius-groei dan zittende (Kinoshita et al. 2023).
- **App:** vlag `lengthened_emphasis` op oefeningen; tip als een spier er geen enkele krijgt (R5). Leg uit dat volledige ROM met nadruk op de stretch een veilige standaard is.

### A7. Progressieve overbelasting en stagnatie
- Spieren groeien zolang de prikkel voldoende blijft; in de praktijk volg je dat via meer reps of meer gewicht bij gelijke inspanning (dubbele progressie) en via e1RM-trends.
- Stagnatie heeft vaak oorzaken buiten de training (slaap, calorietekort, stress). **In een cut is kracht behouden al een succes.**
- Deloads (lichtere week) zijn een praktijkinstrument bij opgestapelde vermoeidheid (vuistregel).

### A8. Eiwit
- Meta-analyse (Morton et al., *Br J Sports Med* 2018; 49 studies): extra eiwit boven ±1,6 g/kg/dag gaf geen meetbaar extra effect op vetvrije massa bij krachttraining; de bovengrens van het betrouwbaarheidsinterval lag rond 2,2 g/kg.
- Tijdens een calorietekort: Helms et al. (2014) adviseerden 2,3–3,1 g per kg **vetvrije massa** voor slanke, getrainde sporters. Een recentere meta-regressie (Refalo, Trexler & Helms, *Strength and Conditioning Journal* 2025) vond dat meer eiwit samenhing met minder verlies van vetvrije massa, met een sterker verband als je eiwit uitdrukt per kg vetvrije massa; voordeel tot ±1,9 g/kg lichaamsgewicht of ±2,5 g/kg vetvrije massa.
- **App:** standaard 2,0 g/kg; voor mensen met meer lichaamsvet de optie om op doelgewicht of vetvrije massa te rekenen (anders worden de getallen onrealistisch hoog).

### A9. Afvaltempo
- Voor getrainde mensen wordt ±0,5–1% lichaamsgewicht per week aangeraden om spiermassa zo goed mogelijk te behouden (Helms et al. 2014). Bij elite-atleten gaf trager afvallen (0,7%/week) betere resultaten voor vetvrije massa dan sneller (1,4%/week) (Garthe et al. 2011).
- **App:** standaard 0,5–0,75%/week, max 1%/week, nooit onder de geschatte BMR.

### A10. Energieverbruik en de weegschaal
- Dagelijks gewicht schommelt sterk door vocht, zout, koolhydraten en darminhoud. Een **trendlijn** (exponentieel gemiddelde) toont de echte richting.
- Door inname te vergelijken met de verandering van de trend kun je je werkelijke verbruik schatten (principe zoals in MacroFactor; ±7.700 kcal per kg lichaamsgewicht is een benadering). Hoe consequenter je logt, hoe betrouwbaarder.
- **App:** §5.5, met betrouwbaarheidsindicator en uitleg.

### A11. Stappen
- Meta-analyse van 15 cohorten (Paluch et al., *Lancet Public Health* 2022): meer stappen per dag hing samen met een steeds lager sterfterisico tot ±8.000–10.000 stappen bij volwassenen jonger dan 60 (6.000–8.000 bij 60+). 10.000 is dus geen magische grens.
- In een cut helpen stappen ook om het verbruik op peil te houden (vuistregel).
- **App:** standaard stappendoel 8.000, aanpasbaar.

### A12. Wat de app niet weet
- Hersteltoestand, slaap en stress worden niet gemeten; de "frisheid"-kaart is een schatting.
- Wetenschap evolueert; de artikels hebben een datum en worden bijgewerkt.

### Bronnen (zet DOI's/links in SCIENCE.md na verificatie)
- Pelland JC, Remmert JF, Robinson ZP, Hinson SR, Zourdos MC. The resistance training dose response: meta-regressions exploring the effects of weekly volume and frequency on muscle hypertrophy and strength gains. *Sports Medicine* 2026;56(2):481–505.
- Remmert JF, Pelland JC, Robinson ZP, Hinson SR, Zourdos MC. Is there too much of a good thing? Meta-regressions of the effect of per-session volume on hypertrophy and strength. *SportRχiv* 2025 (preprint).
- Robinson ZP, Pelland JC, Remmert JF, Refalo MC, Jukic I, Steele J, Zourdos MC. Exploring the dose–response relationship between estimated resistance training proximity to failure, strength gain, and muscle hypertrophy. *Sports Medicine* 2024.
- Refalo MC et al. Similar muscle hypertrophy following eight weeks of resistance training to momentary muscular failure or with repetitions-in-reserve in resistance-trained individuals. *J Sports Sci* 2024.
- Schoenfeld BJ, Grgic J, Ogborn D, Krieger JW. Strength and hypertrophy adaptations between low- vs. high-load resistance training: a systematic review and meta-analysis. *JSCR* 2017;31(12):3508–3523.
- Singer A, Wolf M, Generoso L, et al., Schoenfeld BJ. Give it a rest: a systematic review with Bayesian meta-analysis on the effect of inter-set rest interval duration on muscle hypertrophy. *Front Sports Act Living* 2024;6:1429789.
- Bernárdez-Vázquez R, et al. Resistance training variables for optimization of muscle hypertrophy: an umbrella review. *Front Sports Act Living* 2022.
- Wolf M, Androulakis-Korakakis P, Fisher J, Schoenfeld B, et al. Partial vs full range of motion resistance training: a systematic review and meta-analysis. *Int J Strength Cond* 2023.
- Maeo S, et al. Greater hamstrings muscle hypertrophy but similar damage protection after training at long versus short muscle lengths. *Med Sci Sports Exerc* 2021.
- Maeo S, et al. Triceps brachii hypertrophy is substantially greater after elbow extension training performed in the overhead versus neutral arm position. *Eur J Sport Sci* 2023.
- Kinoshita M, Maeo S, et al. Triceps surae muscle hypertrophy is greater after standing versus seated calf-raise training. *Front Physiol* 2023;14:1272106.
- Morton RW, et al. A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults. *Br J Sports Med* 2018;52(6):376–384.
- Helms ER, Aragon AA, Fitschen PJ. Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation. *J Int Soc Sports Nutr* 2014.
- Refalo MC, Trexler ET, Helms ER. Effect of dietary protein on fat-free mass in energy restricted, resistance-trained individuals: an updated systematic review with meta-regression. *Strength Cond J* 2025.
- Garthe I, Raastad T, Refsnes PE, et al. Effect of two different weight-loss rates on body composition and strength and power-related performance in elite athletes. *IJSNEM* 2011;21(2):97–104.
- Paluch AE, et al. Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts. *Lancet Public Health* 2022;7(3):e219–e228.

---

## Bijlage B — Spiertaxonomie & startmapping

### B1. Taxonomie (id → Nederlandse naam)
`chest` borst · `front_delts` voorste schouder · `side_delts` zijkant schouder · `rear_delts` achterste schouder · `triceps` triceps · `biceps` biceps · `forearms` onderarmen · `lats` lats (brede rugspier) · `upper_back` bovenrug (rhomboïden/midden-trapezius) · `traps` trapezius (boven) · `lower_back` onderrug · `abs` buikspieren · `obliques` schuine buikspieren · `quads` quadriceps · `hamstrings` hamstrings · `glutes` bilspieren · `adductors` adductoren · `abductors` abductoren · `calves` kuiten · `neck` nek.

Mapping vanuit free-exercise-db: abdominals→abs · abductors→abductors · adductors→adductors · biceps→biceps · calves→calves · chest→chest · forearms→forearms · glutes→glutes · hamstrings→hamstrings · lats→lats · lower back→lower_back · middle back→upper_back · neck→neck · quadriceps→quads · shoulders→**handmatig** (persen → front_delts, zijwaartse raises → side_delts, reverse fly/face pull → rear_delts) · traps→traps · triceps→triceps.

### B2. Startmapping (1 = direct, 0,5 = indirect; ★ = `lengthened_emphasis`)
| Oefening | Mapping |
|---|---|
| Barbell bench press | chest 1 · front_delts 0,5 · triceps 0,5 |
| Incline dumbbell press | chest 1 · front_delts 0,5 · triceps 0,5 |
| Dips (chest lean) | chest 1 · triceps 0,5 · front_delts 0,5 |
| Cable fly / dumbbell fly ★ | chest 1 |
| Overhead press | front_delts 1 · side_delts 0,5 · triceps 0,5 |
| Lateral raise (cable ★ / dumbbell) | side_delts 1 |
| Reverse fly / face pull | rear_delts 1 · upper_back 0,5 |
| Pull-up / lat pulldown | lats 1 · upper_back 0,5 · biceps 0,5 |
| Barbell / cable / chest-supported row | upper_back 1 · lats 0,5 · rear_delts 0,5 · biceps 0,5 |
| Barbell curl | biceps 1 · forearms 0,5 |
| Incline dumbbell curl ★ | biceps 1 |
| Preacher curl | biceps 1 |
| Overhead triceps extension ★ | triceps 1 |
| Triceps pushdown | triceps 1 |
| Back squat (diep) | quads 1 · glutes 0,5 · adductors 0,5 |
| Leg press | quads 1 · glutes 0,5 · adductors 0,5 |
| Leg extension | quads 1 |
| Bulgarian split squat ★ | quads 1 · glutes 0,5 · adductors 0,5 |
| Romanian deadlift ★ | hamstrings 1 · glutes 0,5 · lower_back 0,5 |
| Conventional deadlift | lower_back 1 · glutes 0,5 · hamstrings 0,5 · quads 0,5 · upper_back 0,5 |
| Seated leg curl ★ | hamstrings 1 |
| Lying leg curl | hamstrings 1 |
| Hip thrust | glutes 1 · hamstrings 0,5 |
| Standing calf raise ★ | calves 1 |
| Seated calf raise | calves 1 |
| Cable crunch | abs 1 |
| Hanging leg raise | abs 1 |
| Shrugs | traps 1 |
| Hip adduction machine | adductors 1 |
| Hip abduction machine | abductors 1 |

Breid deze tabel uit tot ±150 gecureerde oefeningen volgens dezelfde logica, en documenteer twijfelgevallen in `DECISIONS.md`.

---

## Bijlage C — Ideeën om de app extra goed te maken (na de kern, prioriteren met Stan)

- **Gym-modus:** extra grote UI tijdens de workout, wake lock, alles met één duim.
- **"Machine bezet"-knop** die meteen 3 alternatieven toont op basis van spier + uitrusting.
- **Slimme notities:** "stoelhoogte 4", "grip breed" — verschijnen automatisch bij de volgende keer.
- **Pijnbewust:** oefeningen met recente pijn-vlag krijgen een waarschuwing en alternatieven.
- **Weekritueel op zondag:** één mooi check-in-scherm (gewichtstrend, voeding, stappen, trainingen, spiervolume) + 1–3 concrete aanpassingen.
- **Rep-PR-muur:** visuele "trofeeënkast" per oefening.
- **Deelkaarten** in de eigen stijl na een workout of PR.
- **Buddy-uitdaging** met je vriendin (stappen of trainingen per week).
- **Import uit Strong/Hevy** zodat oude data niet verloren gaat.
- **Supplementen-checklist** en **watertracker**.
- **Gewichtsstap-geheugen** per toestel (bv. kabelmachine gaat per 5 kg).
- **Achievements** met eigen SVG-badges (geen emoji's), nooit dwingend.
- **Later (alleen als Stan ooit wil betalen):** native wrapper met Capacitor voor Apple Health-integratie en echte haptics.

---

*Einde van de prompt. Begin nu met Fase 0 in plan mode: lees alles, maak CLAUDE.md en docs/, stel Stan alleen de vragen die je voor Fase 0 nodig hebt, en leg hem uit wat hij als eerste moet doen.*
