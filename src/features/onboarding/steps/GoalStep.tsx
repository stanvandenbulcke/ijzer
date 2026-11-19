import { clampRate } from '../../../domain/profile/defaults'
import type { Goal, Profile } from '../../../domain/profile/types'
import { t } from '../../../i18n'
import { formatNumber } from '../../../i18n/format'
import { Chip } from '../../../ui/Chip'
import { ChoiceRow, Field } from '../Field'

const o = t.onboarding.goal
const PACES: Record<Goal, number[]> = {
  cut: [-0.25, -0.5, -0.75, -1],
  maintain: [0],
  bulk: [0.25, 0.5],
}
const DEFAULT_PACE: Record<Goal, number> = { cut: -0.5, maintain: 0, bulk: 0.25 }

export function GoalStep({
  draft,
  update,
}: {
  draft: Profile
  update: (p: Partial<Profile>) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <ChoiceRow>
        {(['cut', 'maintain', 'bulk'] as const).map((goal) => (
          <Chip
            key={goal}
            selected={draft.goal === goal}
            onClick={() => update({ goal, ratePctPerWeek: DEFAULT_PACE[goal] })}
          >
            {o[goal]}
          </Chip>
        ))}
      </ChoiceRow>
      {draft.goal !== 'maintain' && (
        <Field label={o.pace}>
          <ChoiceRow>
            {PACES[draft.goal].map((pct) => (
              <Chip
                key={pct}
                selected={draft.ratePctPerWeek === pct}
                onClick={() => update({ ratePctPerWeek: clampRate(pct) })}
              >
                {o.pacePct(formatNumber(Math.abs(pct), 2))}
              </Chip>
            ))}
          </ChoiceRow>
        </Field>
      )}
      <p className="text-sm text-muted">{o.safety}</p>
    </div>
  )
}
