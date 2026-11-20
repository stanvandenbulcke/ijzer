import type { Profile } from '../../../domain/profile/types'
import { t } from '../../../i18n'
import { Stepper } from '../../../ui/Stepper'

export function ScheduleStep({
  draft,
  update,
}: {
  draft: Profile
  update: (p: Partial<Profile>) => void
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      <Stepper
        label={t.onboarding.schedule.perWeek}
        value={draft.trainingDaysPerWeek}
        onChange={(trainingDaysPerWeek) => update({ trainingDaysPerWeek })}
        min={1}
        max={7}
        maxDecimals={0}
      />
      <p className="font-semibold">
        {t.onboarding.schedule.timesPerWeek(draft.trainingDaysPerWeek)}
      </p>
    </div>
  )
}
