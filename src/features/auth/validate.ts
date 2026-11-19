import { t } from '../../i18n'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateCredentials(email: string, password: string) {
  return {
    email: EMAIL.test(email.trim()) ? undefined : t.auth.errors.email,
    password: password.length >= 8 ? undefined : t.auth.errors.passwordShort,
  }
}
