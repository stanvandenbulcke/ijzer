import { STANDARD_PLATES } from '../strength/plates'
import type { Equipment } from '../training/types'
import type { GymEquipment, Profile } from './types'

export const DEFAULT_EQUIPMENT: GymEquipment = {
  barKg: 20,
  plates: STANDARD_PLATES,
  dumbbellStepKg: 2,
  machineStepKg: 5,
  cableStepKg: 2.5,
}

export const DEFAULT_PROFILE: Profile = {
  name: '',
  birthDate: null,
  birthYear: null,
  sex: null,
  heightCm: null,
  weightKg: null,
  goal: 'maintain',
  ratePctPerWeek: 0,
  activity: 'moderate',
  stepGoal: 8000,
  trainingDaysPerWeek: 4,
  equipment: DEFAULT_EQUIPMENT,
  settings: { restCompoundSec: 150, restIsolationSec: 90, wakeLock: true, restSound: true },
  onboardedAt: null,
}

/** Safety limit for the weight-loss pace (SPEC §5.5): never faster than 1 % per week. */
export const MAX_LOSS_PCT_PER_WEEK = 1

/** Clamps a planned pace to the safe range: −1 % … +0.5 % body weight per week. */
export function clampRate(ratePctPerWeek: number): number {
  return Math.min(0.5, Math.max(-MAX_LOSS_PCT_PER_WEEK, ratePctPerWeek))
}

/**
 * Smallest sensible weight step for an exercise, from the gym settings: a barbell goes up by
 * two of the lightest plates, dumbbells by the dumbbell step, and so on.
 */
export function incrementFor(equipment: Equipment, gym: GymEquipment): number {
  const lightest = Math.min(...gym.plates.filter((p) => p.perSide > 0).map((p) => p.kg), 2.5)
  switch (equipment) {
    case 'barbell':
    case 'ez_bar':
      return lightest * 2
    case 'dumbbell':
      return gym.dumbbellStepKg
    case 'machine':
      return gym.machineStepKg
    case 'cable':
      return gym.cableStepKg
    case 'kettlebell':
      return 4
    default:
      return 2.5
  }
}

/** Default rest: longer for compounds than for isolation (SPEC §4.3). */
export function defaultRestSec(
  mechanic: 'compound' | 'isolation' | null,
  profile: Profile,
): number {
  return mechanic === 'isolation'
    ? profile.settings.restIsolationSec
    : profile.settings.restCompoundSec
}
