import { useState } from 'react'
import type { Profile } from '../../../domain/profile/types'
import { formatDateDigits, parseDutchDate, toDutchDate } from '../../../i18n/dateInput'
import { t } from '../../../i18n'
import { TextField } from '../../../ui/TextField'

const o = t.onboarding.about

/** dd/mm/jjjj with the slashes added automatically while typing. */
export function BirthDateField({
  draft,
  update,
}: {
  draft: Profile
  update: (p: Partial<Profile>) => void
}) {
  const [text, setText] = useState(draft.birthDate ? toDutchDate(draft.birthDate) : '')
  const complete = text.length === 10
  const iso = complete ? parseDutchDate(text) : null
  return (
    <TextField
      label={o.birthDate}
      placeholder={o.birthDatePlaceholder}
      inputMode="numeric"
      autoComplete="bday"
      value={text}
      error={complete && !iso ? o.birthDateError : undefined}
      onChange={(e) => {
        const next = formatDateDigits(e.target.value)
        setText(next)
        const parsed = next.length === 10 ? parseDutchDate(next) : null
        update({ birthDate: parsed, birthYear: parsed ? Number(parsed.slice(0, 4)) : null })
      }}
    />
  )
}
