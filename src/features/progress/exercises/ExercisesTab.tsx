import { useNavigate } from 'react-router'
import type { TrainingData } from '../../../data/useTrainingData'
import { e1rmSeries, sessions } from '../../../domain/training/series'
import { t } from '../../../i18n'
import { formatDayShort, formatNumber } from '../../../i18n/format'
import { ExerciseThumb } from '../../../ui/ExerciseThumb'
import { ListRow } from '../../../ui/ListRow'
import { Section } from '../Section'

/** Every exercise you have done, most recent first. */
export function ExercisesTab({ data }: { data: TrainingData }) {
  const navigate = useNavigate()
  const ids = [...new Set([...data.perfs].reverse().map((p) => p.exerciseId))]
  return (
    <Section title={t.progress.exercisesTitle}>
      <div className="border-t border-line">
        {ids.map((id) => {
          const exercise = data.library.byId(id)
          if (!exercise) return null
          const perfs = data.perfsOf(id)
          const all = sessions(perfs)
          const best = e1rmSeries(perfs).at(-1)
          return (
            <ListRow
              key={id}
              title={exercise.name}
              subtitle={`${t.progress.sessions(all.length)} · ${t.progress.lastDone(formatDayShort(all.at(-1)!.day))}`}
              leading={<ExerciseThumb exercise={exercise} />}
              trailing={
                best ? (
                  <span className="font-display text-xl font-bold">
                    {formatNumber(best.value, 0)}
                  </span>
                ) : undefined
              }
              onClick={() => navigate(`/progressie/oefening/${encodeURIComponent(id)}`)}
            />
          )
        })}
      </div>
    </Section>
  )
}
