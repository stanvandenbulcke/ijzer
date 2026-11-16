# Gids voor Stan

Korte uitleg in gewone taal. Je hoeft dit niet vanbuiten te kennen; kom terug als je iets zoekt.

## Hoe werkt dit project?

- **De code** staat op GitHub. Dat is de kluis: wat daar staat, raak je niet kwijt.
- **Claude** schrijft en test de code. Jij bekijkt het resultaat op je iPhone en zegt wat beter kan.
- **De hosting** (Cloudflare of Vercel) zet elke nieuwe versie van GitHub automatisch online.
- **Supabase** is de database met de accounts en al je trainingsdata (vanaf Fase 1).

## De app testen op je iPhone

1. Open de link van de online versie in **Safari** (niet Chrome).
2. Tik onderaan op de **Deel-knop** (vierkantje met pijl omhoog).
3. Kies **Zet op beginscherm** en tik op **Voeg toe**.
4. Open de app voortaan via het icoon op je beginscherm.

Zie je na een update nog de oude versie? Sluit de app volledig af en open hem opnieuw.

## Moet ik iets installeren op mijn laptop?

Niet verplicht. Claude bouwt in de cloud en jij test via de link. Wil je de code zelf bekijken
of lokaal draaien, installeer dan:

1. **Node.js LTS** — https://nodejs.org (de grote groene knop).
2. **Git for Windows** — https://git-scm.com/download/win (alles op standaard laten).
3. **VS Code** — https://code.visualstudio.com

Controleer daarna in PowerShell:

```powershell
node -v
git --version
```

## De app op je laptop starten (optioneel)

```powershell
git clone https://github.com/<jouw-naam>/ijzer.git
cd ijzer
npm install
npm run dev
```

Open daarna http://localhost:5173 in je browser. Stoppen doe je met `Ctrl + C`.

## Handige commando's

| Commando           | Wat het doet                                                    |
| ------------------ | --------------------------------------------------------------- |
| `npm run dev`      | Start de app op je laptop                                       |
| `npm run check`    | Controleert alles: types, stijlregels, tests en de build        |
| `npm run test:e2e` | Opent de app automatisch op iPhone-formaat en maakt screenshots |
| `git pull`         | Haalt de nieuwste versie van GitHub                             |

## Geheimen

Zet **nooit** wachtwoorden of sleutels in de code of in de chat. Het bestand `.env.local` is
bedoeld voor instellingen en wordt nooit naar GitHub gestuurd. In de app zelf komt alleen de
publieke Supabase-sleutel; de geheime sleutels blijven bij Supabase.

## Supabase pauzeert na 7 dagen stilte

Op het gratis plan gaat een project slapen als er een week niets gebeurt. Je data blijft
bewaard. Wakker maken: log in op supabase.com, open het project en klik **Restore**. De app
blijft intussen offline bruikbaar.

## Later: e-mails via een eigen SMTP-dienst

Supabase verstuurt maar een paar e-mails per uur (genoeg voor 2–10 gebruikers). Wordt dat te
weinig, dan kan je in Supabase onder _Authentication → Emails → SMTP Settings_ een gratis
SMTP-dienst koppelen. Dat werken we uit wanneer het nodig is.

## Woordenlijst

- **Repo**: de projectmap op GitHub.
- **Commit**: een opgeslagen stap in de geschiedenis van de code.
- **Push**: je commits naar GitHub sturen.
- **Deploy**: een versie online zetten.
- **PWA**: een website die zich gedraagt als een app op je beginscherm.
- **RLS**: regels in de database die ervoor zorgen dat je alleen je eigen data ziet.
