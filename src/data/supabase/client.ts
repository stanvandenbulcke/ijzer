import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { supabaseProject } from './config'

let client: SupabaseClient | null = null

/**
 * The Supabase client, or null when this build has no accounts.
 * `implicit` flow: a password-reset link opened in Safari works even though the request came
 * from the home-screen app, which has separate storage (a PKCE verifier would be missing).
 */
export function supabase(): SupabaseClient | null {
  if (!supabaseProject) return null
  client ??= createClient(supabaseProject.url, supabaseProject.publishableKey, {
    auth: {
      flowType: 'implicit',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'ijzer-auth',
    },
  })
  return client
}
