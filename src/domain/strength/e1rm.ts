/** Above this many reps an estimated 1RM is too unreliable to show (SPEC §5.1). */
export const MAX_REPS_FOR_E1RM = 12

/**
 * Estimated one-rep max using the Epley formula:
 * `e1RM = weight × (1 + reps / 30)`, with 1 rep returning the weight itself.
 *
 * Returns `null` when no trustworthy estimate exists: reps outside 1–12,
 * a non-positive weight, or non-finite input. Callers must treat `null`
 * as "no data" (a gap in a chart), never as zero.
 *
 * Source: Epley B. (1985), Poundage Chart. Boyd Epley Workout.
 *
 * @param weightKg load in kilograms (for bodyweight exercises: bodyweight + added load)
 * @param reps completed repetitions, whole number
 */
export function estimateOneRepMax(weightKg: number, reps: number): number | null {
  if (!Number.isFinite(weightKg) || !Number.isInteger(reps)) return null
  if (weightKg <= 0 || reps < 1 || reps > MAX_REPS_FOR_E1RM) return null
  if (reps === 1) return weightKg
  return weightKg * (1 + reps / 30)
}
