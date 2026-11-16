/**
 * Dutch (Flemish-friendly, informal "je") UI strings.
 * All visible text lives here so English can be added later as `en.ts`
 * with the same shape (`Messages`).
 */
export const nl = {
  common: {
    backToStart: 'Terug naar start',
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
  error: {
    title: 'Er ging iets mis',
    body: 'Herlaad de pagina. Je gegevens zijn niet verloren.',
    reload: 'Herladen',
  },
}

export type Messages = typeof nl
