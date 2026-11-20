import { useBodyWeights } from './bodyRepo'
import { useProfile } from './profileRepo'
import { weightTrend } from '../domain/energy/trend'
import { ageOn, dailyTargets, withCustomTargets, type Targets } from '../domain/nutrition/targets'

/**
 * Today's targets from the profile (SPEC §5.4–5.5). Uses the weight trend when there are
 * weigh-ins, else the profile weight. Own targets (profile.customTargets) win where set.
 * Null when there is nothing to calculate and no own kcal.
 */
export function useTargets(
  today: string,
  options: { calculatedOnly?: boolean } = {},
): Targets | null | undefined {
  const profile = useProfile()
  const weights = useBodyWeights()
  if (!profile || !weights) return undefined
  const trend = weightTrend(weights.map((w) => ({ day: w.day, kg: w.kg }))).at(-1)?.trend
  const weightKg = trend ?? profile.weightKg
  const auto =
    weightKg && profile.heightCm
      ? dailyTargets({
          weightKg,
          heightCm: profile.heightCm,
          age: ageOn(profile.birthDate, profile.birthYear, today),
          sex: profile.sex,
          activity: profile.activity,
          goal: profile.goal,
          ratePctPerWeek: profile.ratePctPerWeek,
        })
      : null
  return options.calculatedOnly ? auto : withCustomTargets(auto, profile.customTargets)
}
