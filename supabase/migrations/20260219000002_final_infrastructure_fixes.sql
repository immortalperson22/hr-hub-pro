-- 1. Fix user_roles SELECT policy to avoid recursion
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- 2. Update applicants SELECT policy
DROP POLICY IF EXISTS "Admins can view all applications" ON public.applicants;
CREATE POLICY "Admins can view all applications"
ON public.applicants FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Update applicants UPDATE policy
DROP POLICY IF EXISTS "Admins can update all applications" ON public.applicants;
CREATE POLICY "Admins can update all applications"
ON public.applicants FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Link applicants directly to profiles
ALTER TABLE public.applicants
ADD CONSTRAINT applicants_profiles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id)
ON DELETE CASCADE;

-- 6. Ensure foreign key exists between profiles and auth.users
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_user_id_fkey') THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- 7. Create the trigger function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'New Applicant'),
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
