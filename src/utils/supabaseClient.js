import { createClient } from '@supabase/supabase-js';

// Use your real Supabase project URL and anon/public key from dashboard
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// export const supabase = createClient(supabaseUrl, supabaseKey);


export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    global: {
      headers: {
        // apikey added automatically; inject Authorization dynamically when calling
      },
      fetch: async (url, options = {}) => {
        const token = localStorage.getItem('access_token');
        const headers = new Headers(options.headers || {});
        if (token) headers.set('Authorization', `Bearer ${token}`);
        headers.set('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY);
        return fetch(url, { ...options, headers });
      }
    }
  }
);