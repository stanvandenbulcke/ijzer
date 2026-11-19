/**
 * Muscle taxonomy (SPEC Bijlage B1). Ids are stable: they are stored in the database
 * and used as keys for translations (`t.muscles[id]`) and colours.
 */
export const MUSCLE_IDS = [
  'chest',
  'front_delts',
  'side_delts',
  'rear_delts',
  'triceps',
  'biceps',
  'forearms',
  'lats',
  'upper_back',
  'traps',
  'lower_back',
  'abs',
  'obliques',
  'quads',
  'hamstrings',
  'glutes',
  'adductors',
  'abductors',
  'calves',
  'neck',
] as const

export type MuscleId = (typeof MUSCLE_IDS)[number]

/**
 * Body regions used for colour coding and balance checks (push vs pull, SPEC §5.3 R6).
 * Rear delts count as pull: they are trained by rows and face pulls, not presses.
 */
export type MuscleRegion = 'push' | 'pull' | 'legs' | 'core' | 'neck'

export const MUSCLE_REGION: Record<MuscleId, MuscleRegion> = {
  chest: 'push',
  front_delts: 'push',
  side_delts: 'push',
  triceps: 'push',
  rear_delts: 'pull',
  biceps: 'pull',
  forearms: 'pull',
  lats: 'pull',
  upper_back: 'pull',
  traps: 'pull',
  lower_back: 'core',
  abs: 'core',
  obliques: 'core',
  quads: 'legs',
  hamstrings: 'legs',
  glutes: 'legs',
  adductors: 'legs',
  abductors: 'legs',
  calves: 'legs',
  neck: 'neck',
}

export function isMuscleId(value: string): value is MuscleId {
  return (MUSCLE_IDS as readonly string[]).includes(value)
}
