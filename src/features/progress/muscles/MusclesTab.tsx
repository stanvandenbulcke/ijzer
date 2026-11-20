import { useNavigate } from 'react-router'
import type { TrainingData } from '../../../data/useTrainingData'
import { MUSCLE_IDS, MUSCLE_REGION } from '../../../domain/muscles/taxonomy'
import { fractionalSets, volumeZone } from '../../../domain/volume/fractionalSets'
import { lastDays } from '../../../domain/volume/weekly'
import { t } from '../../../i18n'
import { formatNumber } from '../../../i18n/format'
import { BarRow, Section } from '../Section'
import { ZONE_BG } from '../zones'
import { MuscleLevels } from './MuscleLevels'

export function MusclesTab({ data, today }: { data: TrainingData; today: string }) {
  const navigate = useNavigate()
  const week = fractionalSets(lastDays(data.perfs, today, 7), data.library.byId)
  const month = fractionalSets(lastDays(data.perfs, today, 28), data.library.byId)
  const region = (r: string) =>
    MUSCLE_IDS.filter((m) => MUSCLE_REGION[m] === r).reduce((s, m) => s + (month[m] ?? 0), 0)
  const pairs = [
    ['push_pull', region('push'), region('pull')],
    ['quads_hams', month.quads ?? 0, month.hamstrings ?? 0],
    ['front_rear', month.front_delts ?? 0, month.rear_delts ?? 0],
  ] as const

  return (
    <>
      <MuscleLevels data={data} />
      <Section title={t.progress.muscleWeek} note={t.progress.tapMuscle}>
        {MUSCLE_IDS.map((m) => (
          <BarRow
            key={m}
            label={t.muscles[m]}
            value={week[m] ?? 0}
            max={25}
            text={formatNumber(week[m] ?? 0, 1)}
            color={ZONE_BG[volumeZone(week[m] ?? 0)]}
            onClick={() => navigate(`/progressie/spier/${m}`)}
          />
        ))}
      </Section>
      <Section title={t.progress.balance}>
        {pairs.map(([pair, a, b]) => {
          const [nameA, nameB] = t.progress.balancePairs[pair]
          const total = a + b
          return (
            <div key={pair} className="mb-3">
              <div className="flex justify-between text-sm">
                <span>
                  {nameA} {formatNumber(a, 0)}
                </span>
                <span>
                  {formatNumber(b, 0)} {nameB}
                </span>
              </div>
              <div className="mt-1 flex h-2 overflow-hidden rounded-full bg-line" aria-hidden>
                <span
                  className="bg-plate-red"
                  style={{ width: `${total ? (a / total) * 100 : 50}%` }}
                />
                <span className="flex-1 bg-plate-blue" />
              </div>
            </div>
          )
        })}
      </Section>
    </>
  )
}
