import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let client: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  client = createSupabaseClient(supabaseUrl, supabaseKey);
  return client;
}
