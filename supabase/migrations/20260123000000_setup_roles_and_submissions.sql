-- Step 1: Make sure roles are set in public.user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' 
FROM auth.users 
WHERE email = 'admin@hrhub.com'
AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.users.id);

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'employee' 
FROM auth.users 
WHERE email = 'employee@hrhub.com'
AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.users.id);

-- Step 2: Create submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  salary_pdf TEXT,
  policy_pdf TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','rejected','approved')),
  admin_comment TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: RLS policies
DROP POLICY IF EXISTS "applicant sees own submissions" ON public.submissions;
CREATE POLICY "applicant sees own submissions"
ON public.submissions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin sees all submissions" ON public.submissions;
CREATE POLICY "admin sees all submissions"
ON public.submissions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Step 4: Enable RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
