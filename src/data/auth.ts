import type { Session } from '@supabase/supabase-js'
import { useSyncExternalStore } from 'react'
import { supabase } from './supabase/client'

/** Current session: undefined while starting up, null when signed out. */
let session: Session | null | undefined = supabase() ? undefined : null
const listeners = new Set<() => void>()
let started = false

function start() {
  const client = supabase()
  if (started || !client) return
  started = true
  void client.auth.getSession().then(({ data }) => set(data.session))
  client.auth.onAuthStateChange((_event, next) => set(next))
}

function set(next: Session | null) {
  session = next
  listeners.forEach((l) => l())
}

export function getSession(): Session | null | undefined {
  start()
  return session
}

export function useSession(): Session | null | undefined {
  return useSyncExternalStore(
    (listener) => {
      start()
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => session,
  )
}

export type AuthErrorKind = 'credentials' | 'exists' | 'weak' | 'rate' | 'network' | 'unknown'

function kind(
  error: { code?: string; message?: string; status?: number } | null,
): AuthErrorKind | null {
  if (!error) return null
  if (error.code === 'invalid_credentials') return 'credentials'
  if (error.code === 'user_already_exists' || error.code === 'email_exists') return 'exists'
  if (error.code === 'weak_password') return 'weak'
  if (error.code?.startsWith('over_') || error.status === 429) return 'rate'
  if (!navigator.onLine || error.message?.includes('fetch')) return 'network'
  return 'unknown'
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase()!.auth.signUp({ email, password })
  return { userId: data.user?.id ?? null, hasSession: Boolean(data.session), error: kind(error) }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase()!.auth.signInWithPassword({ email, password })
  return { userId: data.user?.id ?? null, error: kind(error) }
}

/** Sends a reset link; it opens in Safari, where /nieuw-wachtwoord sets the new password. */
export async function requestPasswordReset(email: string) {
  const { error } = await supabase()!.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/nieuw-wachtwoord`,
  })
  return kind(error)
}

export async function updatePassword(password: string) {
  const { error } = await supabase()!.auth.updateUser({ password })
  return kind(error)
}
