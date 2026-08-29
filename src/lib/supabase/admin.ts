import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

/**
 * Server-only Supabase privileged client using SUPABASE_SERVICE_ROLE_KEY.
 *
 * CRITICAL SECURITY CONSTRAINTS:
 * 1. Must NEVER be imported into or executed in client components.
 * 2. Protected by 'server-only' import guard.
 * 3. Never exposed to browser or bundled into client JavaScript.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin configuration missing (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
    },
  });
}
