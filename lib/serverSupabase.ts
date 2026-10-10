import { createClient } from '@supabase/supabase-js';

// These env vars are **secret**, only available on the server.
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// Server‑side client – we never expose it to the browser.
export const serverSupabase = createClient(supabaseUrl, supabaseAnonKey);
