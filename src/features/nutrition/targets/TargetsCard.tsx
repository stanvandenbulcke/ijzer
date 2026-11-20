import { useNavigate } from 'react-router'
import type { Targets } from '../../../domain/nutrition/targets'
import type { Nutrients } from '../../../domain/nutrition/types'
import { t } from '../../../i18n'
import { formatNumber } from '../../../i18n/format'
import { Button } from '../../../ui/Button'
import { cx } from '../../../ui/cx'
import { CountUp } from '../../../ui/motion/CountUp'
import { ProgressRing } from '../../../ui/ProgressRing'

const n = t.nutrition

function MacroBar({
  label,
  eaten,
  target,
  color,
}: {
  label: string
  eaten: number
  target: number | null
  color: string
}) {
  const pct = target ? Math.min(100, (eaten / target) * 100) : 0
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-muted">
          {target
            ? n.ofTarget(formatNumber(eaten, 0), formatNumber(target, 0))
            : `${formatNumber(eaten, 0)} ${n.gram}`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden>
        <div className={cx('h-full', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** Kcal ring (eaten / target / over) and bars for protein, carbs and fat (SPEC §4.5). */
export function TargetsCard({ totals, targets }: { totals: Nutrients; targets: Targets | null }) {
  const navigate = useNavigate()
  const left = targets ? targets.kcal - totals.kcal : null
  return (
    <section className="rounded-md border border-line bg-surface p-4">
      <div className="flex items-center gap-4">
        <ProgressRing
          value={totals.kcal}
          max={targets?.kcal ?? Math.max(totals.kcal, 1)}
          label={`${totals.kcal} ${n.kcal} ${n.eaten}`}
          size={132}
          tone={left !== null && left < 0 ? 'red' : 'yellow'}
          animateIn
        >
          <span className="font-display text-4xl leading-none font-black">
            <CountUp value={totals.kcal} />
          </span>
          <span className="text-xs text-muted">
            {targets ? `/ ${formatNumber(targets.kcal, 0)} ${n.kcal}` : n.kcal}
          </span>
        </ProgressRing>
        <div className="flex flex-1 flex-col gap-2.5">
          {left !== null && (
            <p
              className={cx(
                'font-display text-2xl font-bold uppercase',
                left < 0 && 'text-red-text',
              )}
            >
              {left >= 0 ? n.left(formatNumber(left, 0)) : n.over(formatNumber(-left, 0))}
            </p>
          )}
          <MacroBar
            label={n.macros.protein}
            eaten={totals.protein}
            target={targets?.protein ?? null}
            color="bg-plate-red"
          />
          <MacroBar
            label={n.macros.carbs}
            eaten={totals.carbs}
            target={targets?.carbs ?? null}
            color="bg-plate-blue"
          />
          <MacroBar
            label={n.macros.fat}
            eaten={totals.fat}
            target={targets?.fat ?? null}
            color="bg-plate-green"
          />
        </div>
      </div>
      {targets ? (
        <p className="mt-3 text-xs text-muted">
          {targets.flooredAtBmr && `${n.flooredAtBmr} `}
          {n.targetsNote(formatNumber(targets.bmr, 0), formatNumber(targets.tdee, 0))}
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-sm text-muted">{n.targetsMissing}</p>
          <Button variant="secondary" onClick={() => navigate('/welkom?terug=/voeding')}>
            {n.targetsMissingAction}
          </Button>
        </div>
      )}
    </section>
  )
}
