import type { MuscleId, MuscleRegion } from '../domain/muscles/taxonomy'
import { nlDesign } from './nlDesign'

/**
 * Dutch (Flemish-friendly, informal "je") UI strings.
 * All visible text lives here so English can be added later as `en.ts`
 * with the same shape (`Messages`).
 */
export const nl = {
  common: {
    backToStart: 'Terug naar start',
    close: 'Sluiten',
    undo: 'Ongedaan maken',
    notifications: 'Meldingen',
    done: 'Klaar',
    kg: 'kg',
    reps: 'reps',
  },
  numberPad: {
    backspace: 'Wis laatste cijfer',
    comma: 'Komma',
    decrease: (step: string) => `Min ${step}`,
    increase: (step: string) => `Plus ${step}`,
  },
  stepper: {
    decrease: (step: string) => `Verlaag met ${step}`,
    increase: (step: string) => `Verhoog met ${step}`,
  },
  tabs: {
    label: 'Hoofdnavigatie',
    today: 'Vandaag',
    train: 'Train',
    nutrition: 'Voeding',
    progress: 'Progressie',
    me: 'Ik',
  },
  muscles: {
    chest: 'Borst',
    front_delts: 'Voorste schouder',
    side_delts: 'Zijkant schouder',
    rear_delts: 'Achterste schouder',
    triceps: 'Triceps',
    biceps: 'Biceps',
    forearms: 'Onderarmen',
    lats: 'Lats',
    upper_back: 'Bovenrug',
    traps: 'Trapezius',
    lower_back: 'Onderrug',
    abs: 'Buikspieren',
    obliques: 'Schuine buikspieren',
    quads: 'Quadriceps',
    hamstrings: 'Hamstrings',
    glutes: 'Bilspieren',
    adductors: 'Adductoren',
    abductors: 'Abductoren',
    calves: 'Kuiten',
    neck: 'Nek',
  } satisfies Record<MuscleId, string>,
  regions: {
    push: 'Duwen',
    pull: 'Trekken',
    legs: 'Benen',
    core: 'Romp',
    neck: 'Nek',
  } satisfies Record<MuscleRegion, string>,
  volumeZones: {
    none: 'Niet getraind',
    low: 'Te weinig',
    moderate: 'Matig',
    target: 'Doelzone',
    high: 'Hoog',
    veryHigh: 'Erg hoog',
  },
  landing: {
    tagline: 'Elke rep telt.',
    promise: 'Log je training in seconden, zie precies of je sterker wordt, en begrijp waarom.',
    statusTitle: 'In opbouw',
    statusBody: 'Het fundament staat. Inloggen, je routines en de rest volgen in de komende fases.',
    installTitle: 'Zet op je beginscherm',
    installSteps: [
      'Open deze pagina in Safari.',
      'Tik onderaan op de Deel-knop.',
      'Kies "Zet op beginscherm".',
    ],
    installedNote: 'Je gebruikt de app vanaf je beginscherm.',
    version: 'Versie',
  },
  notFound: {
    title: 'Deze pagina bestaat niet',
    body: 'De link klopt niet of de pagina is verhuisd.',
  },
  design: nlDesign,
  error: {
    title: 'Er ging iets mis',
    body: 'Herlaad de pagina. Je gegevens zijn niet verloren.',
    reload: 'Herladen',
  },
}

export type Messages = typeof nl
