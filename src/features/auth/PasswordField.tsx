import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { t } from '../../i18n'
import { IconButton } from '../../ui/Button'
import { TextField } from '../../ui/TextField'

export function PasswordField({
  label,
  value,
  onChange,
  error,
  hint,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  hint?: string
  autoComplete: 'current-password' | 'new-password'
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <TextField
        label={label}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        hint={hint}
        autoComplete={autoComplete}
        className="[&_input]:pr-12"
      />
      <IconButton
        icon={visible ? EyeOff : Eye}
        label={visible ? t.auth.hidePassword : t.auth.showPassword}
        onClick={() => setVisible((v) => !v)}
        className="absolute top-[1.85rem] right-0.5"
      />
    </div>
  )
}
