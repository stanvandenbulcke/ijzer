import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { addDays } from '../../domain/time'
import { t } from '../../i18n'
import { Badge } from '../../ui/Badge'
import { LineChart } from '../../ui/charts/LineChart'
import { MuscleMap } from '../../ui/muscle-map/MuscleMap'

const d = t.landing.demo

/** A phone-ish frame around a real component rendered with demo data. */
function Screen({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <figure className="flex w-[17rem] shrink-0 snap-start flex-col gap-3 rounded-lg border border-line bg-surface p-4">
      <div className="min-h-44">{children}</div>
      <figcaption>
        <p className="font-display text-2xl font-bold uppercase">{title}</p>
        <p className="text-sm text-muted">{body}</p>
      </figcaption>
    </figure>
  )
}

function SetLogDemo() {
  const rows = [
    { set: '1', prev: '80 × 8', kg: '82,5', reps: '8', done: true, pr: true },
    { set: '2', prev: '80 × 8', kg: '82,5', reps: '8', done: true },
    { set: '3', prev: '80 × 7', kg: '82,5', reps: '7', done: false },
  ]
  return (
    <div aria-hidden>
      <p className="mb-2 font-display text-xl font-bold uppercase">{d.exercise}</p>
      {rows.map((r) => (
        <div
          key={r.set}
          className="grid grid-cols-[2rem_1fr_3.5rem_2.5rem_2.25rem] items-center gap-1.5 border-t border-line py-1.5"
        >
          {r.pr ? (
            <Badge tone="pr">PR</Badge>
          ) : (
            <span className="text-center font-display text-lg font-bold">{r.set}</span>
          )}
          <span className="text-xs text-muted">
            {d.previous} {r.prev}
          </span>
          <span
            className={`rounded-sm bg-surface-2 py-1 text-center font-display text-xl font-bold ${r.done ? '' : 'text-muted'}`}
          >
            {r.kg}
          </span>
          <span
            className={`rounded-sm bg-surface-2 py-1 text-center font-display text-xl font-bold ${r.done ? '' : 'text-muted'}`}
          >
            {r.reps}
          </span>
          <span
            className={`flex size-9 items-center justify-center rounded-sm border ${r.done ? 'border-plate-green bg-plate-green text-on-accent' : 'border-line-strong text-muted'}`}
          >
            <Check size={20} strokeWidth={2.5} />
          </span>
        </div>
      ))}
    </div>
  )
}

/** Eight weekly sessions of demo data. */
const e1rmDemo = [92, 93.3, 95, 94.2, 96.7, 98, 99.2, 101.3].map((value, i) => ({
  day: addDays('2026-09-07', i * 7),
  value,
}))

export function DemoScreens() {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
      <Screen title={d.logTitle} body={d.logBody}>
        <SetLogDemo />
      </Screen>
      <Screen title={d.prTitle} body={d.prBody}>
        <LineChart
          label={d.prChart}
          unit="kg"
          height={170}
          series={[{ points: e1rmDemo, color: 'var(--plate-blue)' }]}
        />
      </Screen>
      <Screen title={d.mapTitle} body={d.mapBody}>
        <div className="flex justify-center">
          <MuscleMap
            size="md"
            label={d.mapLabel}
            fills={{
              chest: { color: 'var(--plate-green)' },
              lats: { color: 'var(--plate-green)' },
              upper_back: { color: 'var(--plate-green)' },
              front_delts: { color: 'var(--plate-blue)' },
              side_delts: { color: 'var(--plate-blue)' },
              triceps: { color: 'var(--plate-blue)' },
              biceps: { color: 'var(--plate-blue)' },
              quads: { color: 'var(--zone-low)' },
              hamstrings: { color: 'var(--zone-low)' },
            }}
          />
        </div>
      </Screen>
    </div>
  )
}
