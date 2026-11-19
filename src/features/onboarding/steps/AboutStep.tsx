import type { Profile } from '../../../domain/profile/types'
import { t } from '../../../i18n'
import { formatNumber, parseDecimal } from '../../../i18n/format'
import { Chip } from '../../../ui/Chip'
import { TextField } from '../../../ui/TextField'
import { ChoiceRow, Field } from '../Field'

const o = t.onboarding.about

export function AboutStep({
  draft,
  update,
}: {
  draft: Profile
  update: (p: Partial<Profile>) => void
}) {
  const num = (value: number | null) => (value === null ? '' : formatNumber(value, 1))
  return (
    <div className="flex flex-col gap-5">
      <TextField
        label={o.name}
        value={draft.name}
        autoComplete="nickname"
        onChange={(e) => update({ name: e.target.value })}
      />
      <TextField
        label={o.birthYear}
        inputMode="numeric"
        defaultValue={draft.birthYear ?? ''}
        onChange={(e) => update({ birthYear: parseDecimal(e.target.value) })}
      />
      <Field label={o.sex}>
        <ChoiceRow>
          <Chip selected={draft.sex === 'male'} onClick={() => update({ sex: 'male' })}>
            {o.male}
          </Chip>
          <Chip selected={draft.sex === 'female'} onClick={() => update({ sex: 'female' })}>
            {o.female}
          </Chip>
          <Chip selected={draft.sex === null} onClick={() => update({ sex: null })}>
            {o.none}
          </Chip>
        </ChoiceRow>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label={o.height}
          suffix="cm"
          inputMode="numeric"
          defaultValue={num(draft.heightCm)}
          onChange={(e) => update({ heightCm: parseDecimal(e.target.value) })}
        />
        <TextField
          label={o.weight}
          suffix={t.common.kg}
          inputMode="decimal"
          defaultValue={num(draft.weightKg)}
          onChange={(e) => update({ weightKg: parseDecimal(e.target.value) })}
        />
      </div>
    </div>
  )
}
