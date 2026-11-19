import type { MuscleId } from '../../domain/muscles/taxonomy'
import type { MuscleFill } from './MuscleMap'

/** Primary muscles bright, secondary half-transparent (SPEC §4.2). */
export function involvementFills(
  muscles: Array<{ muscle: MuscleId; weight: number }>,
  color = 'var(--plate-yellow)',
): MuscleFill {
  const fills: MuscleFill = {}
  for (const { muscle, weight } of muscles)
    fills[muscle] = { color, opacity: weight === 1 ? 1 : 0.45 }
  return fills
}
