import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://mvaempwaprqjqdpmwrpf.supabase.co';
// Gunakan service_role key untuk backend bypass RLS pada storage
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabaseBucket = process.env.SUPABASE_PDF_BUCKET || 'dokumen';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default supabase;
