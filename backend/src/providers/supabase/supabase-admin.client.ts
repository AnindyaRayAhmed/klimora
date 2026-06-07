import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "../../config/env.js";

let cachedClient: SupabaseClient | undefined;

export function getSupabaseAdminClient(): SupabaseClient {
  cachedClient ??= createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}
