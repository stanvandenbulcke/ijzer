import { useBodyWeights } from './bodyRepo'
import { useProfile } from './profileRepo'
import { weightTrend } from '../domain/energy/trend'
import { ageOn, dailyTargets, type Targets } from '../domain/nutrition/targets'

/**
 * Today's targets from the profile (SPEC §5.4–5.5). Uses the weight trend when there are
 * weigh-ins, else the profile weight. Null when weight or height is unknown.
 */
export function useTargets(today: string): Targets | null | undefined {
  const profile = useProfile()
  const weights = useBodyWeights()
  if (!profile || !weights) return undefined
  const trend = weightTrend(weights.map((w) => ({ day: w.day, kg: w.kg }))).at(-1)?.trend
  const weightKg = trend ?? profile.weightKg
  if (!weightKg || !profile.heightCm) return null
  return dailyTargets({
    weightKg,
    heightCm: profile.heightCm,
    age: ageOn(profile.birthDate, profile.birthYear, today),
    sex: profile.sex,
    activity: profile.activity,
    goal: profile.goal,
    ratePctPerWeek: profile.ratePctPerWeek,
  })
}
