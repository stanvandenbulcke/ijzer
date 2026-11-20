import type { Freshness } from '../../domain/analysis/rules'

/** Tab Progressie (SPEC §4.8) and the analysis coach (SPEC §5.3). */
export const progress = {
  title: 'Progressie',
  tabsLabel: 'Onderdelen van Progressie',
  tabs: {
    overzicht: 'Overzicht',
    oefeningen: 'Oefeningen',
    spiergroepen: 'Spiergroepen',
    lichaam: 'Lichaam',
    stappen: 'Stappen',
    analyse: 'Analyse',
  },
  empty: {
    title: 'Nog niets te tonen',
    body: 'Rond je eerste training af. Daarna zie je hier je volume, records en trends.',
  },
  career: 'Jouw totaal',
  tonnage: 'ton getild',
  comparison: {
    piano: (n: string) => `Dat is evenveel als ${n} piano's.`,
    cow: (n: string) => `Dat is evenveel als ${n} koeien.`,
    car: (n: string) => `Dat is evenveel als ${n} auto's.`,
    elephant: (n: string) => `Dat is evenveel als ${n} olifanten.`,
    trex: (n: string) => `Dat is evenveel als ${n} T-rexen.`,
    bus: (n: string) => `Dat is evenveel als ${n} stadsbussen.`,
    whale: (n: string) => `Dat is evenveel als ${n} blauwe vinvissen.`,
  },
  careerStats: {
    workouts: (n: number) => (n === 1 ? 'training' : 'trainingen'),
    sets: (n: number) => (n === 1 ? 'set' : 'sets'),
    reps: (n: number) => (n === 1 ? 'rep' : 'reps'),
    hours: 'uur',
    minutes: 'min',
  },
  levels: {
    title: 'Spierlevels',
    note: 'Elke set en elk nieuw record laat een spier stijgen. Tik een spier voor details.',
    empty: 'Rond je eerste training af: dan krijgen je spieren hun eerste level.',
    level: (n: number) => `Level ${n}`,
    toNext: (muscle: string) => `${muscle}: voortgang naar het volgende level`,
    detail: (sets: string, prs: number) =>
      `${sets} sets${prs > 0 ? ` · ${prs === 1 ? '1 sessie' : `${prs} sessies`} met een record` : ''}`,
    tiers: {
      plate5: '1',
      plate10: '2–4',
      plate15: '5–8',
      plate20: '9–12',
      plate25: '13+',
    },
    how: 'Hoe werkt dit?',
    explanation: [
      'Elke afgevinkte set geeft punten aan de spieren die hij traint: 1 punt voor de spier die de oefening vooral traint, ½ punt voor spieren die meehelpen.',
      'Word je sterker op een oefening (een nieuw geschat maximum), dan krijgt de spier die hij vooral traint 10 bonuspunten.',
      'Levels worden steeds moeilijker: level 2 vraagt 10 punten, level 5 160 en level 10 810. Het maximum is level 20.',
      'De kleuren zijn die van echte halterschijven: wit (5 kg) voor level 1, groen (10) voor 2–4, geel (15) voor 5–8, blauw (20) voor 9–12 en rood (25) vanaf 13.',
      'Overgeslagen oefeningen en sets die je niet afvinkte tellen nergens mee. Een level is een spelletje om je te motiveren, geen meting van hoe groot of sterk een spier echt is.',
    ],
  },
  wellbeing: {
    title: 'Slaap, energie en kracht',
    note: 'Op basis van je check-ins op Vandaag en hoe sterk je die dag was, vergeleken met je eigen record.',
    factor: { sleep: 'een goede nacht', energy: 'een dag met veel energie' },
    stronger: (factor: string, pct: string) => `Na ${factor} was je gemiddeld ${pct} % sterker`,
    weaker: (factor: string, pct: string) => `Na ${factor} was je gemiddeld ${pct} % zwakker`,
    basis: (n: number, good: number, poor: number) =>
      `Gebaseerd op ${n} trainingen: ${good} goede (4–5) en ${poor} slechte (1–2) dagen.`,
    strength: { weak: 'Zwak verband', moderate: 'Matig verband', strong: 'Duidelijk verband' },
    notYet: (n: number, min: number) => `${n} van ${min} trainingsdagen met een check-in.`,
    howTo:
      'Vul elke dag op Vandaag je energie en slaap in. Je ziet hier pas iets als er genoeg goede én slechte dagen zijn, zodat het geen toeval is.',
    causation:
      'Let op: een verband is geen bewijs. Misschien train je beter na een goede nacht, maar het kan ook iets anders zijn (stress, eten, het uur van je training).',
  },
  recordWall: 'Recordmuur',
  recordWallNote:
    'Hoeveel kg je naar schatting 1 keer zou kunnen tillen, berekend uit je beste set. Een schatting, geen test.',
  recordWallLabel: (name: string, kg: string) => `${name}: geschat maximum ${kg} kg`,
  chartNeedsTwo: 'Na je tweede sessie van deze oefening zie je hier een lijn.',
  heatTitle: 'Hoe hard je elke spier raakte',
  calendar: 'Trainingen, laatste 12 weken',
  calendarLabel: (n: number) => `${n} trainingen in de laatste 12 weken`,
  perWeek: 'Per week',
  muscleWeek: 'Volume per spier, laatste 7 dagen',
  muscleWeekNote: 'Fractionele sets: direct telt 1, indirect ½. Zones zijn vuistregels.',
  tapMuscle: 'Tik een spier in de lijst voor details.',
  weeklyVolume: 'Totaal volume per week',
  recentPrs: 'Recente records',
  exercisesTitle: 'Getrainde oefeningen',
  lastDone: (day: string) => `laatst ${day}`,
  sessions: (n: number) => (n === 1 ? '1 sessie' : `${n} sessies`),
  periods: { '4w': '4 weken', '3m': '3 maanden', '1y': '1 jaar', all: 'Alles' },
  periodLabel: 'Periode',
  e1rmChart: 'Geschatte 1RM per sessie',
  e1rmEstimate: 'Schatting (Epley); sets boven 12 reps tellen niet mee.',
  repTable: 'Rep-records',
  repCol: 'Reps',
  weightCol: 'Beste gewicht',
  sessionsList: 'Sessies',
  skippedSession: 'overgeslagen',
  notesTitle: 'Notities en pijn',
  muscleDetail: {
    weekly: 'Sets per week',
    target: 'Doelzone 10–20',
    contributors: 'Wat bijdraagt (4 weken)',
    frequency: (n: number) => `${n}× per week getraind (gemiddeld, 4 weken)`,
    avgRir: (rir: string) => `Gemiddelde RIR: ${rir}`,
  },
  balance: 'Balans (4 weken)',
  balancePairs: {
    push_pull: ['Duwen', 'Trekken'] as const,
    quads_hams: ['Quadriceps', 'Hamstrings'] as const,
    front_rear: ['Voorste schouder', 'Achterste schouder'] as const,
  },
  body: {
    weight: 'Gewicht',
    log: 'Gewicht ingeven',
    sheetTitle: 'Gewicht vandaag',
    chartLabel: 'Gewicht: lichte punten zijn metingen, de dikke lijn is de trend',
    trendNote: 'De trendlijn dempt schommelingen door vocht, zout en eten.',
    empty: 'Weeg je een paar keer per week, liefst ’s ochtends na het toilet.',
    entries: 'Metingen',
    deleted: 'Meting verwijderd',
    measurementsSoon:
      'Maten, progressiefoto’s en je echte verbruik (TDEE) komen in een volgende update.',
  },
  steps: {
    title: 'Stappen',
    body: 'Stappen uit Apple Health via een Opdracht op je iPhone komen in een volgende update.',
  },
  analysis: {
    intro: 'Tips op basis van je eigen trainingen. Vuistregels zijn als vuistregel aangeduid.',
    none: 'Geen opmerkingen: je training ziet er evenwichtig uit. Ga zo door.',
    severity: { info: 'Info', tip: 'Tip', waarschuwing: 'Let op' },
    ruleOfThumb: 'Vuistregel',
    freshnessTitle: 'Frisheid per spier',
    freshnessNote:
      'Expliciet een schatting: uren sinds je laatste training × aantal sets. Slaap en stress meten we niet.',
    freshness: {
      fresh: 'Fris',
      recovering: 'Herstellend',
      just_trained: 'Net getraind',
    } satisfies Record<Freshness, string>,
  },
}

/** Texts per analysis rule (SPEC §5.3). `why` explains the evidence or marks a rule of thumb. */
export const insights = {
  R1_low: {
    title: 'Weinig volume deze week',
    body: (list: string) => `${list}. De doelzone is 10–20 fractionele sets per week.`,
    why: 'Volume is de sterkste knop voor spiergroei, met afnemende meeropbrengst (Pelland et al. 2026). De banden 10–20 zijn een praktische vuistregel.',
  },
  R1_high: {
    title: 'Erg veel volume',
    body: (list: string) => `${list}. Meer dan 25 sets per week: kijk of je goed herstelt.`,
    why: 'Meer sets blijven iets toevoegen, maar herstel en tijd worden de beperking (Pelland et al. 2026). Vuistregel.',
  },
  R2: {
    title: 'Veel sets in één sessie',
    body: (muscle: string, sets: string) =>
      `${muscle} kreeg ${sets} sets in één training. Spreid ze over meer dagen.`,
    why: 'Boven ±11 fractionele sets per spier per sessie lijkt er weinig meerwaarde voor groei (Remmert et al. 2025, preprint).',
  },
  R3: {
    title: 'Ver van falen',
    body: (rir: string) =>
      `Je gemiddelde RIR is ${rir}. Probeer je werksets op 0–3 reps van falen te eindigen.`,
    why: 'Dichter bij falen trainen hangt samen met meer spiergroei (Robinson et al. 2024). Tot volledig falen is niet nodig (Refalo et al. 2024).',
  },
  R4: {
    title: 'Korte rustpauzes',
    body: (sec: string) => `Tussen je zware sets rust je meestal ${sec} s. Neem er 2–3 minuten.`,
    why: 'Rust langer dan 60 s gaf een klein voordeel, mogelijk doordat je meer volume haalt. Het bewijs is nog onzeker (Singer et al. 2024).',
  },
  R5: {
    title: 'Train ook op lange spierlengte',
    body: (muscle: string, exercise: string) =>
      `${muscle}: geen oefening in gerekte positie. Probeer bijvoorbeeld ${exercise}.`,
    why: 'Oefeningen in de gerekte positie gaven meer groei: overhead triceps (Maeo 2023), zittende leg curl (Maeo 2021), staande kuiten (Kinoshita 2023).',
  },
  R6: {
    title: 'Uit balans',
    body: (strong: string, weak: string, ratio: string) =>
      `${strong} krijgt ${ratio}× zoveel sets als ${weak} (4 weken).`,
    why: 'Vuistregel: meer dan 2:1 tussen tegenoverliggende spieren is een reden om bij te sturen.',
  },
  R7: {
    title: 'Stagnatie',
    body: (exercise: string) =>
      `${exercise}: je geschatte 1RM steeg niet in je laatste 4 sessies. Wissel je rep-bereik of variant, neem een lichtere week of kijk naar slaap en eten.`,
    bodyCut: (exercise: string) =>
      `${exercise}: geen stijging de laatste 4 sessies. In een cut is kracht behouden al een succes.`,
    why: 'Vuistregel. Stagnatie heeft vaak oorzaken buiten de training: slaap, calorietekort, stress.',
  },
  R8: {
    title: 'Tijd voor een lichtere week?',
    body: (n: number) =>
      `${n} oefeningen gingen tegelijk achteruit terwijl je volume hoog is. Overweeg een deload-week.`,
    why: 'Vuistregel: een lichtere week helpt bij opgestapelde vermoeidheid.',
  },
  R9: {
    title: 'Eén keer per week, veel sets',
    body: (muscle: string, sets: string) =>
      `${muscle}: ${sets} sets in één sessie per week. Splits ze over twee dagen.`,
    why: 'Afgeleid van R2: bij gelijk weekvolume maakt de frequentie weinig uit, maar per sessie loont veel volume minder (Pelland 2026, Remmert 2025).',
  },
}
