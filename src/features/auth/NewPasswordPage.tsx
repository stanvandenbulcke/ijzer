import { useState } from 'react'
import { Link } from 'react-router'
import { updatePassword, useSession } from '../../data/auth'
import { t } from '../../i18n'
import { Button } from '../../ui/Button'
import { LoadingState } from '../../ui/LoadingState'
import { AuthLayout } from './AuthLayout'
import { PasswordField } from './PasswordField'

const a = t.auth

/**
 * /nieuw-wachtwoord — opened from the reset mail, usually in Safari. The link signs this
 * browser in temporarily; after saving, Stan logs in with the new password in the app.
 */
export function NewPasswordPage() {
  const session = useSession()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [done, setDone] = useState(false)

  if (session === undefined) return <LoadingState />
  if (!session && !done) {
    return (
      <AuthLayout title={a.reset.title} onSubmit={() => undefined}>
        <p role="alert" className="text-red-text">
          {a.reset.invalid}
        </p>
        <Link to="/wachtwoord-vergeten" className="font-semibold text-accent-text">
          {a.forgot.title}
        </Link>
      </AuthLayout>
    )
  }

  const submit = async () => {
    if (password.length < 8) return setError(a.errors.passwordShort)
    const result = await updatePassword(password)
    if (result) return setError(a.errors[result])
    setDone(true)
  }

  return (
    <AuthLayout
      title={a.reset.title}
      body={done ? undefined : a.reset.body}
      onSubmit={() => void submit()}
    >
      {done ? (
        <>
          <p role="status" className="text-green-text">
            {a.reset.done}
          </p>
          <Link to="/login" className="font-semibold text-accent-text">
            {a.reset.toLogin}
          </Link>
        </>
      ) : (
        <>
          <PasswordField
            label={a.newPassword}
            value={password}
            onChange={setPassword}
            error={error}
            hint={a.passwordHint}
            autoComplete="new-password"
          />
          <Button type="submit" size="lg" block>
            {a.reset.submit}
          </Button>
        </>
      )}
    </AuthLayout>
  )
}
