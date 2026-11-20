import { useCheckIns, saveCheckIn } from '../../data/checkInsRepo'
import { t } from '../../i18n'
import { Chip } from '../../ui/Chip'
import { Card } from './TodayCards'

const c = t.today.checkIn
const SCORES = [1, 2, 3, 4, 5] as const

function Scale({
  label,
  value,
  onPick,
}: {
  label: string
  value: number
  onPick: (v: number) => void
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 font-semibold">{label}</legend>
      <div className="grid grid-cols-5 gap-1.5">
        {SCORES.map((score) => (
          <Chip
            key={score}
            selected={value === score}
            aria-label={`${label}: ${c.scoreLabel(score)}`}
            className="justify-center font-display text-xl"
            onClick={() => onPick(score)}
          >
            {score}
          </Chip>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted" aria-hidden>
        <span>{c.low}</span>
        <span>{c.high}</span>
      </div>
    </fieldset>
  )
}

/**
 * Two taps in the morning: energy and sleep (1–5). Saved per day, synced, and used on the
 * insights screen once there is enough data. Never required.
 */
export function CheckInCard({ today }: { today: string }) {
  const checkIns = useCheckIns()
  if (!checkIns) return null
  const current = checkIns.find((x) => x.day === today)
  const done = Boolean(current?.energy && current.sleep)
  return (
    <Card title={c.title}>
      <div className="flex flex-col gap-4">
        <Scale
          label={c.energy}
          value={current?.energy ?? 0}
          onPick={(energy) => void saveCheckIn(today, { energy })}
        />
        <Scale
          label={c.sleep}
          value={current?.sleep ?? 0}
          onPick={(sleep) => void saveCheckIn(today, { sleep })}
        />
        <p className="text-sm text-muted" aria-live="polite">
          {done ? c.thanks : c.why}
        </p>
      </div>
    </Card>
  )
}
