import { Radio } from 'lucide-react'
import type { BuddyLive } from '../../../data/live/liveStore'
import { t } from '../../../i18n'
import { useNow } from '../../../ui/useNow'
import { cx } from '../../../ui/cx'
import { setText } from './liveText'

const l = t.together.live

/** A buddy's workout as it happens: name, duration and every ticked set per exercise. */
export function LiveCard({ name, live }: { name: string; live: BuddyLive | undefined }) {
  const now = useNow(30_000)
  const snap = live?.snapshot ?? null
  return (
    <article className="rounded-md border border-line bg-surface p-4" aria-live="polite">
      <header className="flex items-center gap-2">
        <span
          aria-hidden
          className={cx(
            'size-2.5 rounded-full',
            snap ? 'bg-plate-green' : live?.connected ? 'bg-line-strong' : 'bg-line',
          )}
        />
        <h3 className="flex-1 font-display text-2xl leading-tight font-bold uppercase">
          {snap ? l.training(name) : l.idle(name)}
        </h3>
        {snap && <Radio aria-hidden size={18} className="text-green-text" />}
      </header>
      {!live?.connected && !snap && <p className="mt-1 text-sm text-muted">{l.connecting}</p>}
      {snap && (
        <>
          <p className="text-sm text-muted">
            {snap.workoutName} · {l.since(Math.floor((now - Date.parse(snap.startedAt)) / 60_000))}
          </p>
          {snap.exercises.length === 0 && <p className="mt-2 text-sm">{l.noSets}</p>}
          <ul className="mt-2 flex flex-col">
            {snap.exercises.map((ex, i) => (
              <li key={`${ex.name}-${i}`} className="border-t border-line py-2">
                <p className="font-semibold">
                  {ex.name}
                  {ex.state !== 'doing' && (
                    <span className="ml-2 text-sm font-normal text-muted">
                      {ex.state === 'skipped' ? l.skipped : l.replaced}
                    </span>
                  )}
                </p>
                {ex.sets.length > 0 && (
                  <p className="font-display text-xl font-bold">
                    {ex.sets
                      .map((s) => (s.warmup ? `${l.warmup} ${setText(s)}` : setText(s)))
                      .join('  ·  ')}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  )
}
