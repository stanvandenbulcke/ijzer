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
    <Stepper
      label={t.onboarding.schedule.perWeek}
      value={draft.trainingDaysPerWeek}
      onChange={(trainingDaysPerWeek) => update({ trainingDaysPerWeek })}
      min={1}
      max={7}
      maxDecimals={0}
    />
  )
}
