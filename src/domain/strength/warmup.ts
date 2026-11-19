export interface WarmupSet {
  weightKg: number
  reps: number
}

/**
 * Warm-up heuristic (SPEC §5.1, a rule of thumb, not science): for heavy compounds
 * bar × 10, 40 % × 8, 60 % × 5, 75 % × 3, 85 % × 1; for isolation 50 % × 10, 75 % × 5.
 * Weights are rounded down to `stepKg` and steps that are not heavier than the previous
 * one (or than the bar) are dropped.
 */
export function warmupSets(
  workKg: number,
  options: { barKg?: number; stepKg?: number; compound?: boolean } = {},
): WarmupSet[] {
  const { barKg = 0, stepKg = 2.5, compound = true } = options
  if (workKg <= 0) return []
  const scheme: Array<[number, number]> = compound
    ? [
        [0.4, 8],
        [0.6, 5],
        [0.75, 3],
        [0.85, 1],
      ]
    : [
        [0.5, 10],
        [0.75, 5],
      ]

  const sets: WarmupSet[] = []
  if (compound && barKg > 0 && workKg > barKg) sets.push({ weightKg: barKg, reps: 10 })
  for (const [fraction, reps] of scheme) {
    const weightKg = Math.floor((workKg * fraction) / stepKg) * stepKg
    const last = sets.at(-1)?.weightKg ?? 0
    if (weightKg > last && weightKg > barKg && weightKg < workKg) sets.push({ weightKg, reps })
  }
  return sets
}
