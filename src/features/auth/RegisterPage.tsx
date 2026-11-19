import { useState } from 'react'
import { Link } from 'react-router'
import { signUp, signIn } from '../../data/auth'
import { t } from '../../i18n'
import { Button } from '../../ui/Button'
import { TextField } from '../../ui/TextField'
import { AuthLayout } from './AuthLayout'
import { PasswordField } from './PasswordField'
import { useFinishSignIn } from './useFinishSignIn'
import { validateCredentials } from './validate'

const a = t.auth

/** /registreren — e-mail + password; signed in straight away (no confirmation mail, ADR-017). */
export function RegisterPage() {
  const finish = useFinishSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    const check = validateCredentials(email, password)
    setErrors(check)
    if (check.email || check.password) return
    setBusy(true)
    const result = await signUp(email.trim(), password)
    if (result.error === 'exists') {
      // Already registered with the same password? Then just log in.
      const login = await signIn(email.trim(), password)
      if (login.userId) return finish(login.userId)
    }
    setBusy(false)
    if (result.error || !result.userId)
      return setErrors({ form: a.errors[result.error ?? 'unknown'] })
    await finish(result.userId)
  }

  return (
    <AuthLayout
      title={a.register.title}
      body={a.register.body}
      onSubmit={() => void submit()}
      footer={
        <Link to="/login" className="min-h-11 py-3 font-semibold text-accent-text">
          {a.register.haveAccount}
        </Link>
      }
    >
      <TextField
        label={a.email}
        type="email"
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />
      <PasswordField
        label={a.password}
        value={password}
        onChange={setPassword}
        error={errors.password}
        hint={a.passwordHint}
        autoComplete="new-password"
      />
      {errors.form && (
        <p role="alert" className="text-red-text">
          {errors.form}
        </p>
      )}
      <Button type="submit" size="lg" block disabled={busy}>
        {a.register.submit}
      </Button>
    </AuthLayout>
  )
}
