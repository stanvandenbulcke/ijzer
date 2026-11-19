/**
 * Wetenschap-bibliotheek (SPEC Bijlage A). Short articles in plain Dutch: "In het kort", the
 * evidence, what the app does with it, and sources. `level` separates evidence from rules of
 * thumb. Full references: docs/SCIENCE.md.
 */
export interface Article {
  id: string
  title: string
  short: string
  level: 'evidentie' | 'vuistregel'
  body: string[]
  app: string
  sources: string[]
}

export const scienceUi = {
  title: 'Wetenschap',
  intro:
    'Waarom de app je deze tips geeft, met de bronnen erbij. Eerlijk over wat zeker is en wat een vuistregel is.',
  short: 'In het kort',
  app: 'Wat doet de app hiermee',
  sources: 'Bronnen',
  levels: { evidentie: 'Evidentie', vuistregel: 'Vuistregel' },
  updated: 'Bijgewerkt november 2026',
  readMore: 'Lees het artikel',
}

export const articles: Article[] = [
  {
    id: 'volume',
    title: 'Trainingsvolume',
    short:
      'Meer sets per spier per week geven meer groei, maar elke extra set levert iets minder op.',
    level: 'evidentie',
    body: [
      'Volume is de trainingsknop met het duidelijkste verband met spiergroei. De grootste meta-regressie tot nu toe (67 studies, ruim 2.000 deelnemers) vond dat meer wekelijkse sets zowel groei als kracht verhogen, met afnemende meeropbrengst. Voor kracht vlakt de curve sneller af dan voor groei.',
      'Sets waarbij een spier alleen meehelpt, zoals de triceps bij bankdrukken, tellen voor de helft: "fractionele sets". Die telmethode paste het best bij de data.',
    ],
    app: 'De app telt fractionele sets per spier en toont 10–20 per week als doelzone. Die band is een praktische vuistregel: meer kan, maar herstel en tijd worden dan de beperking.',
    sources: [
      'Pelland et al., Sports Medicine 2026',
      'Bernárdez-Vázquez et al., Front Sports Act Living 2022',
    ],
  },
  {
    id: 'per-session',
    title: 'Sets per sessie en frequentie',
    short:
      'Boven ±11 sets voor één spier in één training lijkt er weinig bij te komen. Spreiden loont.',
    level: 'evidentie',
    body: [
      'Bij gelijk weekvolume maakt het voor groei weinig uit hoe vaak je een spier traint. Voor kracht helpt een hogere frequentie wel wat.',
      'Een preprint van dezelfde onderzoeksgroep suggereert dat er per sessie weinig meerwaarde is boven ongeveer 11 fractionele sets per spier. Frequentie is dus vooral een middel om je volume behapbaar te verdelen.',
    ],
    app: 'De app geeft een tip als één spier in één training veel meer dan 11 sets kreeg, of als je een spier maar één keer per week met heel veel sets traint.',
    sources: ['Remmert et al., SportRχiv 2025 (preprint)', 'Pelland et al., Sports Medicine 2026'],
  },
  {
    id: 'rir',
    title: 'Hoe dicht bij falen?',
    short:
      'Dichter bij falen geeft meer groei, maar volledig falen is niet nodig: 0–3 reps over is genoeg.',
    level: 'evidentie',
    body: [
      'RIR betekent "reps in reserve": hoeveel herhalingen je nog had gekund. Een grote meta-regressie vond dat dichter bij falen samenhangt met meer spiergroei, maar niet met meer krachtwinst.',
      'Een gecontroleerde studie bij getrainde mensen vond vergelijkbare groei bij trainen tot falen en bij 1–2 reps over, met meer vermoeidheid bij falen.',
    ],
    app: 'Standaard mikken routines op RIR 1–3. Log je RIR, dan krijg je een tip als je gemiddeld meer dan 4 reps overhoudt. Sets met RIR boven 5 tellen niet mee voor volume.',
    sources: ['Robinson et al., Sports Medicine 2024', 'Refalo et al., J Sports Sci 2024'],
  },
  {
    id: 'reps',
    title: 'Gewicht en rep-bereik',
    short:
      'Licht en zwaar geven vergelijkbare groei als je dicht bij falen gaat. Zwaar geeft meer kracht.',
    level: 'evidentie',
    body: [
      'Een meta-analyse van 21 studies vond dat lichte en zware gewichten vergelijkbare spiergroei geven zolang je sets tot of dicht bij falen gaan. Zware gewichten gaven meer maximale kracht.',
      'Elk bereik van ongeveer 5 tot 30 reps werkt dus voor groei. 6 tot 15 reps is meestal het meest tijdsefficiënt: dat is een vuistregel.',
    ],
    app: 'Je kiest je rep-bereik per oefening zelf. De app stelt 6–10 voor zware basisoefeningen en 10–15 voor isolatie voor.',
    sources: ['Schoenfeld et al., JSCR 2017'],
  },
  {
    id: 'rest',
    title: 'Rust tussen sets',
    short:
      'Langer dan een minuut rusten geeft een klein voordeel, waarschijnlijk doordat je meer volume haalt.',
    level: 'evidentie',
    body: [
      'Een Bayesiaanse meta-analyse vond een klein voordeel voor rustpauzes langer dan 60 seconden. Het aantal studies is klein en vooral bij ongetrainde mannen, dus de onzekerheid is groot.',
    ],
    app: 'Standaard rust je 2:30 na zware oefeningen en 1:30 na isolatie. De app meet je echte rust uit het moment waarop je sets afvinkt en geeft een tip als die meestal korter is dan een minuut.',
    sources: ['Singer et al., Front Sports Act Living 2024'],
  },
  {
    id: 'lengthened',
    title: 'Trainen op lange spierlengte',
    short: 'Oefeningen waarbij de spier onder spanning gerekt wordt, lijken extra groei te geven.',
    level: 'evidentie',
    body: [
      'Volledige bewegingsuitslag is gemiddeld minstens zo goed als gedeeltelijk. Gedeeltelijke herhalingen in de gerekte positie lijken beter dan in de verkorte positie. Het onderzoek is nog volop in beweging.',
      'Sterke voorbeelden: overhead triceps extensions gaven meer tricepsgroei dan pushdowns. Zittende leg curls gaven meer hamstringgroei dan liggende. Staande calf raises gaven veel meer kuitgroei dan zittende.',
    ],
    app: 'Oefeningen met nadruk op de gerekte positie krijgen het label "Lange spierlengte". Train je triceps, hamstrings, kuiten of biceps zonder zo\'n oefening, dan stelt de app er een voor.',
    sources: [
      'Wolf et al., Int J Strength Cond 2023',
      'Maeo et al., Eur J Sport Sci 2023',
      'Maeo et al., MSSE 2021',
      'Kinoshita et al., Front Physiol 2023',
    ],
  },
  {
    id: 'progression',
    title: 'Progressie en stagnatie',
    short:
      'Meer reps of meer gewicht bij dezelfde inspanning. In een cut is kracht behouden al winst.',
    level: 'vuistregel',
    body: [
      'Spieren groeien zolang de prikkel groot genoeg blijft. In de praktijk volg je dat met dubbele progressie: eerst reps erbij binnen je bereik, daarna gewicht erbij en terug naar het minimum.',
      'Stagnatie heeft vaak oorzaken buiten de training: slaap, een calorietekort of stress. Een lichtere week (deload) helpt bij opgestapelde vermoeidheid.',
    ],
    app: 'Elke oefening krijgt een doel voor vandaag met een "Waarom?". Stijgt je geschatte 1RM vier sessies niet, dan krijg je opties. In een cut zegt de app eerlijk dat behouden prima is.',
    sources: ['Praktijkkennis; zie docs/SCIENCE.md'],
  },
  {
    id: 'protein',
    title: 'Eiwit',
    short:
      'Rond 1,6 g per kg lichaamsgewicht haal je het meeste voordeel; tot ±2,2 g kan nog iets helpen.',
    level: 'evidentie',
    body: [
      'Een meta-analyse van 49 studies vond boven ongeveer 1,6 g/kg per dag geen meetbaar extra effect op vetvrije massa; de bovengrens van de onzekerheid lag rond 2,2 g/kg.',
      'Tijdens een calorietekort helpt meer eiwit om spier te behouden, vooral als je het uitdrukt per kg vetvrije massa.',
    ],
    app: 'Je eiwitdoel komt in de voedingsupdate: standaard 2,0 g/kg, met de optie om op doelgewicht of vetvrije massa te rekenen.',
    sources: [
      'Morton et al., Br J Sports Med 2018',
      'Helms et al., JISSN 2014',
      'Refalo, Trexler & Helms, Strength Cond J 2025',
    ],
  },
  {
    id: 'weight',
    title: 'Afvaltempo en de weegschaal',
    short:
      'Je gewicht schommelt elke dag. De trendlijn toont de echte richting; afvallen liefst 0,5–1 % per week.',
    level: 'evidentie',
    body: [
      'Je dagelijks gewicht verandert door vocht, zout, koolhydraten en wat er in je darmen zit. Een gemiddelde over tijd (de trend) haalt die ruis eruit.',
      'Voor getrainde mensen wordt 0,5 tot 1 % van je gewicht per week aangeraden om zoveel mogelijk spier te behouden. Trager afvallen gaf bij atleten betere resultaten dan sneller.',
    ],
    app: "De app toont je metingen als lichte punten en de trend als dikke lijn, met de verandering per week. Afvaltempo's boven 1 % per week kan je niet kiezen. Geen medisch advies.",
    sources: ['Helms et al., JISSN 2014', 'Garthe et al., IJSNEM 2011'],
  },
  {
    id: 'unknowns',
    title: 'Wat de app niet weet',
    short:
      'Slaap, stress en herstel meten we niet. Sommige getallen zijn schattingen en worden zo getoond.',
    level: 'vuistregel',
    body: [
      'De "frisheid" per spier is een schatting op basis van uren sinds je training en het aantal sets. De geschatte 1RM is een formule (Epley), geen gemeten maximum.',
      'Wetenschap evolueert. De artikels hebben een datum en worden bijgewerkt als er beter bewijs komt.',
    ],
    app: 'Schattingen hebben een gestippeld label "Schatting". Vuistregels zijn als vuistregel aangeduid.',
    sources: ['Zie docs/SCIENCE.md'],
  },
]

/** Which article explains which analysis rule ("Waarom?" → article). */
export const ARTICLE_FOR_RULE: Record<string, string> = {
  R1_low: 'volume',
  R1_high: 'volume',
  R2: 'per-session',
  R3: 'rir',
  R4: 'rest',
  R5: 'lengthened',
  R6: 'progression',
  R7: 'progression',
  R8: 'progression',
  R9: 'per-session',
}
