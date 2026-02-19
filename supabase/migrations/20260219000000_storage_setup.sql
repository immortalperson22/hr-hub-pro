-- Create storage bucket for applicant documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('applicant-docs', 'applicant-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for applicant-docs

-- 1. Applicants can upload their own documents
CREATE POLICY "Applicants can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'applicant-docs' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Applicants can view their own documents
CREATE POLICY "Applicants can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'applicant-docs' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Admins can view all applicant documents
CREATE POLICY "Admins can view all applicant documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'applicant-docs' AND 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- RPC Function for assigning default role as applicant
CREATE OR REPLACE FUNCTION public.assign_default_role(p_user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_uuid, 'applicant')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
