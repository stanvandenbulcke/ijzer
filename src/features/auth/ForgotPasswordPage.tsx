import { useState } from 'react'
import { requestPasswordReset } from '../../data/auth'
import { t } from '../../i18n'
import { Button } from '../../ui/Button'
import { TextField } from '../../ui/TextField'
import { AuthLayout } from './AuthLayout'
import { validateCredentials } from './validate'

const a = t.auth

/** /wachtwoord-vergeten — sends a reset link (ADR-017). */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    const check = validateCredentials(email, '12345678').email
    setError(check)
    if (check) return
    setBusy(true)
    const result = await requestPasswordReset(email.trim())
    setBusy(false)
    if (result) return setError(a.errors[result])
    setSent(true)
  }

  return (
    <AuthLayout title={a.forgot.title} body={a.forgot.body} onSubmit={() => void submit()}>
      <TextField
        label={a.email}
        type="email"
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
      />
      {sent ? (
        <p role="status" className="text-green-text">
          {a.forgot.sent}
        </p>
      ) : (
        <Button type="submit" size="lg" block disabled={busy}>
          {a.forgot.submit}
        </Button>
      )}
    </AuthLayout>
  )
}
