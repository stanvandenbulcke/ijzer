import { MUSCLE_IDS, type MuscleId } from '../../../domain/muscles/taxonomy'
import { workingSets } from '../../../domain/training/routineEdit'
import type { Exercise, Routine } from '../../../domain/training/types'
import { plannedVolume } from '../../../domain/volume/fractionalSets'
import { t } from '../../../i18n'
import { formatNumber } from '../../../i18n/format'
import { MuscleMap, type MuscleFill } from '../../../ui/muscle-map/MuscleMap'

const e = t.training.editor

/** Muscles that a typical split should not forget (SPEC §4.3: "0 sets voor de achterste delts"). */
const WATCH: MuscleId[] = ['rear_delts', 'side_delts', 'hamstrings', 'calves', 'upper_back']

/**
 * Live preview while building (SPEC §4.3): fractional sets per muscle for this routine,
 * on the muscle map and as numbers. Brighter = more sets.
 */
export function VolumePreview({
  routine,
  byId,
}: {
  routine: Routine
  byId: (id: string) => Exercise | undefined
}) {
  const volume = plannedVolume(
    routine.exercises.map((x) => ({
      exerciseId: x.exerciseId,
      workingSets: workingSets(x).length,
    })),
    byId,
  )
  const trained = MUSCLE_IDS.filter((m) => (volume[m] ?? 0) > 0).sort(
    (a, b) => (volume[b] ?? 0) - (volume[a] ?? 0),
  )
  if (trained.length === 0) return <p className="text-sm text-muted">{e.noVolume}</p>

  const max = Math.max(...trained.map((m) => volume[m]!))
  const fills: MuscleFill = {}
  for (const m of trained)
    fills[m] = { color: 'var(--plate-yellow)', opacity: 0.35 + 0.65 * (volume[m]! / max) }
  const missing = WATCH.filter((m) => !volume[m])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-4">
        <MuscleMap
          size="sm"
          fills={fills}
          label={trained.map((m) => `${t.muscles[m]} ${formatNumber(volume[m]!, 1)}`).join(', ')}
        />
        <ul className="flex flex-1 flex-col gap-1">
          {trained.map((m) => (
            <li key={m} className="flex items-center gap-2 text-sm">
              <span className="flex-1">{t.muscles[m]}</span>
              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-line" aria-hidden>
                <span
                  className="block h-full bg-plate-yellow"
                  style={{ width: `${(volume[m]! / max) * 100}%` }}
                />
              </span>
              <span className="w-8 text-right font-display text-lg font-bold">
                {formatNumber(volume[m]!, 1)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {missing.length > 0 && (
        <p className="text-sm text-muted">
          {e.zeroFor(missing.map((m) => t.muscles[m].toLowerCase()).join(', '))}
        </p>
      )}
      <p className="text-xs text-muted">{e.volumeNote}</p>
    </div>
  )
}
