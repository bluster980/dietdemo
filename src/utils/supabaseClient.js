import { createClient } from '@supabase/supabase-js';

// Use your real Supabase project URL and anon/public key from dashboard
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
