import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Starting migration...\n');

  // First, create exec_sql function if it doesn't exist
  console.log('Creating exec_sql function...');
  const createFnSql = `
    CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `;

  try {
    const { error: fnError } = await supabase.rpc('exec_sql', { sql: createFnSql });
    if (fnError) {
      console.log('exec_sql function might already exist or error:', fnError.message);
    } else {
      console.log('✅ exec_sql function ready!');
    }
  } catch (err) {
    console.log('Note:', err.message);
  }

  const steps = [
    {
      name: 'Step 1: Set admin role',
      sql: `INSERT INTO public.user_roles (user_id, role)
            SELECT id, 'admin' 
            FROM auth.users 
            WHERE email = 'admin@hrhub.com'
            ON CONFLICT (user_id) DO NOTHING;`
    },
    {
      name: 'Step 2: Set employee role',
      sql: `INSERT INTO public.user_roles (user_id, role)
            SELECT id, 'employee' 
            FROM auth.users 
            WHERE email = 'employee@hrhub.com'
            ON CONFLICT (user_id) DO NOTHING;`
    },
    {
      name: 'Step 3: Create submissions table',
      sql: `CREATE TABLE IF NOT EXISTS public.submissions (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL REFERENCES auth.users(id),
              salary_pdf TEXT,
              policy_pdf TEXT,
              status TEXT DEFAULT 'pending' CHECK (status IN ('pending','rejected','approved')),
              admin_comment TEXT,
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );`
    },
    {
      name: 'Step 4: RLS - applicant sees own',
      sql: `DROP POLICY IF EXISTS "applicant sees own submissions" ON public.submissions;
            CREATE POLICY "applicant sees own submissions"
            ON public.submissions FOR SELECT USING (auth.uid() = user_id);`
    },
    {
      name: 'Step 5: RLS - admin sees all',
      sql: `DROP POLICY IF EXISTS "admin sees all submissions" ON public.submissions;
            CREATE POLICY "admin sees all submissions"
            ON public.submissions FOR ALL USING (
              EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() AND role = 'admin'
              )
            );`
    },
    {
      name: 'Step 6: Enable RLS',
      sql: `ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;`
    }
  ];

  for (const step of steps) {
    console.log(`Executing: ${step.name}...`);
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: step.sql });
      if (error) {
        console.error(`❌ Error in ${step.name}:`, error);
      } else {
        console.log(`✅ ${step.name} completed!`);
      }
    } catch (err) {
      console.error(`❌ Unexpected error in ${step.name}:`, err.message);
    }
  }

  console.log('\n✨ Migration finished!');
}

runMigration();
