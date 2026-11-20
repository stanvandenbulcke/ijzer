import type { PlateInventory } from '../strength/plates'

export type Goal = 'cut' | 'maintain' | 'bulk'
export type Sex = 'male' | 'female'
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

export interface GymEquipment {
  barKg: number
  /** Plates per side available in the gym. */
  plates: PlateInventory[]
  dumbbellStepKg: number
  machineStepKg: number
  cableStepKg: number
}

export interface Settings {
  restCompoundSec: number
  restIsolationSec: number
  /** Keep the screen on during a workout (Screen Wake Lock API). */
  wakeLock: boolean
  /** Own sounds for a ticked set, end of rest and a PR. */
  sounds: boolean
}

export interface Profile {
  name: string
  /** "YYYY-MM-DD" */
  birthDate: string | null
  birthYear: number | null
  sex: Sex | null
  heightCm: number | null
  weightKg: number | null
  goal: Goal
  /** Planned change in % of body weight per week (negative = losing). */
  ratePctPerWeek: number
  activity: Activity
  stepGoal: number
  trainingDaysPerWeek: number
  equipment: GymEquipment
  settings: Settings
  onboardedAt: string | null
}
