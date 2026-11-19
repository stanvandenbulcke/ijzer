import type { Activity, Profile } from '../../../domain/profile/types'
import { t } from '../../../i18n'
import { cx } from '../../../ui/cx'
import { Stepper } from '../../../ui/Stepper'
import { Field } from '../Field'

const o = t.onboarding.activity
const LEVELS: Activity[] = ['sedentary', 'light', 'moderate', 'active', 'very_active']

export function ActivityStep({
  draft,
  update,
}: {
  draft: Profile
  update: (p: Partial<Profile>) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div role="radiogroup" aria-label={o.title} className="flex flex-col gap-2">
        {LEVELS.map((level) => {
          const [name, hint] = o.levels[level]
          const selected = draft.activity === level
          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => update({ activity: level })}
              className={cx(
                'press flex min-h-14 flex-col items-start justify-center rounded-md border px-4 py-2 text-left',
                selected ? 'border-focus bg-surface-2' : 'border-line',
              )}
            >
              <span className="font-semibold">{name}</span>
              <span className="text-sm text-muted">{hint}</span>
            </button>
          )
        })}
      </div>
      <Field label={o.steps}>
        <Stepper
          label={o.steps}
          value={draft.stepGoal}
          onChange={(stepGoal) => update({ stepGoal })}
          steps={[500]}
          min={1000}
          max={30000}
          maxDecimals={0}
        />
      </Field>
    </div>
  )
}
