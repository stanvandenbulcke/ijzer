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
  noPr: 'Je eerste records verschijnen na je tweede training per oefening.',
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
