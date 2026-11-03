import type { Database } from '@benben/db-types';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser Supabase client. It only ever receives the anon (publishable) key; the service-role key
 * lives in CI and Edge Function secrets (ADR-002 §15). Returns null when the env is not configured,
 * so the placeholder page still renders on a bare `pnpm dev`.
 */
let client: SupabaseClient<Database> | null | undefined;

export function getSupabase(): SupabaseClient<Database> | null {
  if (client !== undefined) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  client = url && anonKey ? createClient<Database>(url, anonKey) : null;
  return client;
}
