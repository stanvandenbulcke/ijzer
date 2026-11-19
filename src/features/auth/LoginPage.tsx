import { useState } from 'react'
import { Link } from 'react-router'
import { signIn } from '../../data/auth'
import { t } from '../../i18n'
import { Button } from '../../ui/Button'
import { TextField } from '../../ui/TextField'
import { AuthLayout } from './AuthLayout'
import { PasswordField } from './PasswordField'
import { useFinishSignIn } from './useFinishSignIn'
import { validateCredentials } from './validate'

const a = t.auth

/** /login — e-mail + password. No magic links: they would log in Safari, not this app. */
export function LoginPage() {
  const finish = useFinishSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    const check = {
      email: validateCredentials(email, password).email,
      password: password ? undefined : a.errors.passwordShort,
    }
    setErrors(check)
    if (check.email || check.password) return
    setBusy(true)
    const result = await signIn(email.trim(), password)
    setBusy(false)
    if (result.error || !result.userId)
      return setErrors({ form: a.errors[result.error ?? 'unknown'] })
    await finish(result.userId)
  }

  return (
    <AuthLayout
      title={a.login.title}
      onSubmit={() => void submit()}
      footer={
        <>
          <Link to="/wachtwoord-vergeten" className="min-h-11 py-3 font-semibold text-accent-text">
            {a.login.forgot}
          </Link>
          <Link to="/registreren" className="min-h-11 py-3 text-muted">
            {a.login.noAccount}
          </Link>
        </>
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
        autoComplete="current-password"
      />
      {errors.form && (
        <p role="alert" className="text-red-text">
          {errors.form}
        </p>
      )}
      <Button type="submit" size="lg" block disabled={busy}>
        {a.login.submit}
      </Button>
    </AuthLayout>
  )
}
