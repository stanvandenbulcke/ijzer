/** Tab Vandaag: the daily dashboard (SPEC §4.9). */
export const today = {
  title: 'Vandaag',
  greeting: (name: string) => (name ? `Hoi ${name}` : 'Hoi'),
  dayPart: (hour: number) =>
    hour < 6
      ? 'Nachtsessie?'
      : hour < 12
        ? 'Goedemorgen'
        : hour < 18
          ? 'Goedemiddag'
          : 'Goedenavond',
  weekGoal: 'trainingen',
  weekLeft: (n: number) =>
    n <= 0
      ? 'Weekdoel gehaald. Sterk.'
      : n === 1
        ? 'Nog 1 training voor je weekdoel'
        : `Nog ${n} trainingen voor je weekdoel`,
  nextTitle: 'Training van vandaag',
  checkIn: {
    title: 'Hoe voel je je vandaag?',
    energy: 'Energie',
    sleep: 'Slaap vannacht',
    low: 'slecht',
    high: 'top',
    scoreLabel: (n: number) => `${n} van 5`,
    why: 'Twee tikken per dag. Na een paar weken zie je onder Progressie › Analyse of je beter traint na een goede nacht.',
    thanks: 'Bewaard. Je kan het vandaag nog aanpassen.',
  },
  doneTodayTitle: 'Vandaag getraind',
  doneTodayBody: (sets: number) =>
    `Bewaard: ${sets === 1 ? '1 set' : `${sets} sets`}. Rust goed, daar word je sterker van.`,
  doneTodaySummary: 'Bekijk je training',
  doneTodayNext: (name: string) => `Volgende keer: ${name}`,
  doneTodayAgain: 'Nog een training starten',
  nextHint: 'Volgende in je rotatie',
  noRoutine: 'Nog geen routine',
  noRoutineBody: 'Maak een routine of begin een vrije training.',
  makeRoutine: 'Routine maken',
  week: 'Deze week',
  weekCount: (n: number, goal: number) => `${n}/${goal} trainingen`,
  streak: (weeks: number) =>
    weeks === 1 ? '1 week op rij je doel gehaald' : `${weeks} weken op rij je doel gehaald`,
  streakNone: 'Rustdagen tellen nooit tegen je.',
  weekdays: ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'],
  lastPr: 'Laatste record',
  noPr: 'Records verschijnen zodra je een oefening beter doet dan de vorige keer.',
  weight: 'Gewicht',
  logWeight: 'Weeg je',
  weightToday: 'Vandaag gewogen',
  trend: (kg: string, pct: string) => `Trend: ${kg} kg/week (${pct} %)`,
  trendTooShort: 'Na een week wegen zie je je trend.',
  nutrition: 'Voeding',
  nutritionSoon: 'Calorieën, macro’s en barcodescan komen in een volgende update.',
  freshness: 'Frisheid (schatting)',
  coach: 'Tip van de coach',
  coachFact: 'Wist je dat?',
  readMore: 'Lees waarom',
  allTips: 'Alle tips',
}
