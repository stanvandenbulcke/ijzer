/**
 * Supabase projects (SPEC §2: ijzer-dev for testing, ijzer-prod for real use).
 * Only public values live here: the URL and the publishable key (protected by RLS).
 * The service_role / secret keys never appear in the frontend (SPEC §7.3).
 */
export interface SupabaseProject {
  url: string
  publishableKey: string
}

const PROJECTS: Record<'dev' | 'prod', SupabaseProject | null> = {
  dev: {
    url: 'https://qtrdccxbmbqmvrtelxyl.supabase.co',
    publishableKey: 'sb_publishable_DrAvqTPUyPnM-bnIFen9DA_yEOB1bUn',
  },
  prod: {
    url: 'https://hjnmljxonfautstydfyt.supabase.co',
    publishableKey: 'sb_publishable_xnUQju8uTlkmTk1lql8SuQ_e2Pt5E_k',
  },
}

/** `npm run dev` and the e2e build (`--mode e2e`) use dev; the production build uses prod. */
const target = import.meta.env.DEV || import.meta.env.MODE === 'e2e' ? 'dev' : 'prod'

export const supabaseProject: SupabaseProject | null = PROJECTS[target]

/** Accounts and cloud backup are available in this build. */
export const accountsEnabled = supabaseProject !== null
