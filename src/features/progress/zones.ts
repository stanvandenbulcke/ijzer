import type { VolumeZone } from '../../domain/volume/fractionalSets'

/** Token colour per volume zone (SPEC §4.8: legend with numbers). */
export const ZONE_COLOR: Record<VolumeZone, string> = {
  none: 'var(--surface-2)',
  low: 'var(--zone-low)',
  moderate: 'var(--plate-blue)',
  target: 'var(--plate-green)',
  high: 'var(--plate-yellow)',
  veryHigh: 'var(--plate-red)',
}

export const ZONE_BG: Record<VolumeZone, string> = {
  none: 'bg-zone-none',
  low: 'bg-zone-low',
  moderate: 'bg-zone-moderate',
  target: 'bg-zone-target',
  high: 'bg-zone-high',
  veryHigh: 'bg-zone-very-high',
}
