/**
 * Service-role Supabase client for the publishare CMS project
 * (Supabase ref: vpysqshhafthuxvokwqj). All advertorial data lives here —
 * every property app that installs this kit reads/writes into this one
 * Supabase, using the service-role key.
 *
 * SERVER-ONLY. Never import from a Client Component.
 *
 * Env expected on the property app's Vercel project:
 *   NEXT_PUBLIC_SUPABASE_URL       — publishare Supabase URL
 *   SUPABASE_SERVICE_ROLE_KEY      — publishare service role key
 *
 * (Names match the property apps' existing Supabase pattern so seniorsimple /
 * moneysimple / rateroots don't need a second URL/key pair.)
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

export function getAdvertorialSupabase(): SupabaseClient {
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}
