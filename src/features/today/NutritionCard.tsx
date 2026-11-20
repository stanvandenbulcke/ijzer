import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useDayLogs } from '../../data/nutritionRepo'
import { useTargets } from '../../data/useTargets'
import { dayTotals } from '../../domain/nutrition/macros'
import { t } from '../../i18n'
import { formatNumber } from '../../i18n/format'
import { Card } from './TodayCards'

const d = t.today

/** Today's kcal and protein at a glance; tap to open the food diary. */
export function NutritionCard({ today }: { today: string }) {
  const navigate = useNavigate()
  const logs = useDayLogs(today)
  const targets = useTargets(today)
  if (!logs || targets === undefined) return null
  const totals = dayTotals(logs)
  return (
    <Card title={d.nutrition}>
      <button
        type="button"
        onClick={() => navigate('/voeding')}
        className="press flex w-full items-center gap-3 text-left"
        aria-label={d.nutritionOpen}
      >
        <span className="flex flex-1 flex-col">
          <span className="font-display text-3xl font-black">
            {targets
              ? d.nutritionOfTarget(formatNumber(totals.kcal, 0), formatNumber(targets.kcal, 0))
              : d.nutritionEaten(formatNumber(totals.kcal, 0))}
          </span>
          {targets && (
            <span className="text-sm text-muted">
              {d.nutritionProtein(
                formatNumber(totals.protein, 0),
                formatNumber(targets.protein, 0),
              )}
            </span>
          )}
        </span>
        <ChevronRight aria-hidden className="text-muted" />
      </button>
    </Card>
  )
}
