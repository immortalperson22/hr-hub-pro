-- Create applicants table
CREATE TABLE IF NOT EXISTS applicants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pre_employment_url text,
  policy_rules_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'revision_required', 'approved')),
  admin_comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_applicants_user_id ON applicants(user_id);
CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants(status);

-- Enable RLS
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Applicants can see only their own record
CREATE POLICY "Applicants can view their own application" ON applicants
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Applicants can insert their own record
CREATE POLICY "Applicants can insert their own application" ON applicants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Applicants can update their own record
CREATE POLICY "Applicants can update their own application" ON applicants
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Admins can view all records (requires 'admin' role in user_roles table)
CREATE POLICY "Admins can view all applications" ON applicants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Admins can update any record
CREATE POLICY "Admins can update all applications" ON applicants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create storage bucket if it doesn't exist (must be done via dashboard or Supabase CLI)
-- Run this in the Supabase dashboard SQL editor:
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('applicant-docs', 'applicant-docs', false) 
-- ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage
-- Run via Supabase dashboard under Storage > applicant-docs > Policies:
-- 1. Allow authenticated users to upload to their own folder:
--    CREATE POLICY "Users can upload to their own folder"
--    ON storage.objects FOR INSERT WITH CHECK (
--      auth.uid()::text = (storage.foldername(name))[1]
--    );
--
-- 2. Allow authenticated users to read signed URLs:
--    CREATE POLICY "Users can read their own files"
--    ON storage.objects FOR SELECT USING (
--      auth.uid()::text = (storage.foldername(name))[1]
--    );
--
-- 3. Allow admins to read all files:
--    CREATE POLICY "Admins can read all files"
--    ON storage.objects FOR SELECT USING (
--      EXISTS (
--        SELECT 1 FROM user_roles 
--        WHERE user_id = auth.uid() AND role = 'admin'
--      )
--    );
