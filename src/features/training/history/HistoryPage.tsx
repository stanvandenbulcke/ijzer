import { useNavigate } from 'react-router'
import { useTrainingData } from '../../../data/useTrainingData'
import { completedSetCount, workoutVolumeKg } from '../../../domain/training/performances'
import { localDay } from '../../../domain/time'
import { t } from '../../../i18n'
import { formatDayShort, formatMinutes, formatNumber } from '../../../i18n/format'
import { EmptyState } from '../../../ui/EmptyState'
import { ListRow } from '../../../ui/ListRow'
import { LoadingState } from '../../../ui/LoadingState'
import { Page, PageHeader } from '../../../ui/PageHeader'

const h = t.training.historyPage
const month = new Intl.DateTimeFormat('nl-BE', { month: 'long', year: 'numeric', timeZone: 'UTC' })

/** /train/geschiedenis — finished workouts, newest first, grouped per month. */
export function HistoryPage() {
  const navigate = useNavigate()
  const data = useTrainingData()
  if (data === undefined) return <LoadingState />
  const workouts = data?.workouts ?? []
  const typeOf = (id: string) => data?.library.byId(id)?.type

  const groups = new Map<string, typeof workouts>()
  for (const w of workouts) {
    const key = month.format(new Date(`${localDay(w.startedAt).slice(0, 7)}-01T00:00:00Z`))
    groups.set(key, [...(groups.get(key) ?? []), w])
  }

  return (
    <Page>
      <PageHeader title={h.title} back="/train" />
      {workouts.length === 0 && <EmptyState title={h.empty.title} body={h.empty.body} />}
      {[...groups.entries()].map(([label, list]) => (
        <section key={label} className="mb-6">
          <h2 className="mb-1 text-xs font-semibold tracking-widest text-muted uppercase">
            {label}
          </h2>
          <div className="border-t border-line">
            {list.map((w) => {
              const minutes = (Date.parse(w.finishedAt!) - Date.parse(w.startedAt)) / 60_000
              return (
                <ListRow
                  key={w.id}
                  title={w.name}
                  subtitle={`${formatDayShort(localDay(w.startedAt))} · ${formatMinutes(minutes)} · ${t.training.setsCount(completedSetCount(w))}`}
                  trailing={
                    <span className="font-display text-xl font-bold">
                      {formatNumber(workoutVolumeKg(w, typeOf), 0)} kg
                    </span>
                  }
                  onClick={() => navigate(`/train/geschiedenis/${w.id}`)}
                />
              )
            })}
          </div>
        </section>
      ))}
    </Page>
  )
}
