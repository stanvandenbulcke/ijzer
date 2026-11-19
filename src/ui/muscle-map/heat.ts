import { MUSCLE_IDS, type MuscleId } from '../../domain/muscles/taxonomy'
import { volumeZone, type MuscleVolume, type VolumeZone } from '../../domain/volume/fractionalSets'
import type { MuscleFill } from './MuscleMap'

/** Heat colour per weekly volume zone: cold blue → green (target) → yellow → red. */
export const HEAT: Record<VolumeZone, string> = {
  none: 'var(--surface-2)',
  low: 'var(--zone-low)',
  moderate: 'var(--plate-blue)',
  target: 'var(--plate-green)',
  high: 'var(--plate-yellow)',
  veryHigh: 'var(--plate-red)',
}

/** Fills for a muscle map coloured by how hard each muscle was hit. */
export function heatFills(volume: MuscleVolume): MuscleFill {
  const fills: MuscleFill = {}
  for (const m of MUSCLE_IDS as readonly MuscleId[]) {
    const sets = volume[m] ?? 0
    if (sets > 0) fills[m] = { color: HEAT[volumeZone(sets)] }
  }
  return fills
}
