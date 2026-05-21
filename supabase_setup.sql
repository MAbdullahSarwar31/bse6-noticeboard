-- ================================================================
-- Campus Notice Board — Bahria University Lab 10A
-- Supabase SQL Setup Script
-- Run this ONCE in Supabase Dashboard → SQL Editor
-- ================================================================


-- ================================================================
-- SECTION 1: CREATE TABLE profiles
-- ================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id           uuid        PRIMARY KEY DEFAULT auth.uid(),
  email        text        NOT NULL,
  display_name text,
  created_at   timestamptz DEFAULT now()
);


-- ================================================================
-- SECTION 2: CREATE TABLE notices
-- ================================================================
CREATE TABLE IF NOT EXISTS public.notices (
  id         int8        PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      text        NOT NULL,
  body       text        NOT NULL,
  category   text        NOT NULL
               CHECK (category IN (
                 'Academic','Event','Urgent','General','Sports','Administration'
               )),
  created_at timestamptz DEFAULT now()
);


-- ================================================================
-- SECTION 3: ENABLE ROW LEVEL SECURITY
-- ================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices  ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- SECTION 4: RLS POLICIES
-- ================================================================

-- 4a. profiles: users can only read their own profile row
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING ( auth.uid() = id );

-- 4b. profiles: users can only insert their own profile row
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK ( auth.uid() = id );

-- 4c. notices: everyone (including anonymous) can read all notices
CREATE POLICY "notices_select_all"
  ON public.notices
  FOR SELECT
  USING ( true );

-- 4d. notices: only signed-in users can insert, and only as themselves
CREATE POLICY "notices_insert_own"
  ON public.notices
  FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

-- 4e. notices: users can only delete their own notices
CREATE POLICY "notices_delete_own"
  ON public.notices
  FOR DELETE
  USING ( auth.uid() = user_id );


-- ================================================================
-- SECTION 5: TRIGGER — auto-create profile on signup
-- ================================================================

-- Function called after a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop the trigger first if it already exists (idempotent re-run)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Attach the trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ================================================================
-- SECTION 6: ENABLE REALTIME FOR notices TABLE
-- ================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notices;


-- ================================================================
-- SECTION 7: VERIFICATION QUERIES (uncomment to run)
-- ================================================================

-- Check all RLS policies on both tables:
-- SELECT tablename, polname, polcmd, polroles
-- FROM pg_policies
-- WHERE tablename IN ('profiles', 'notices')
-- ORDER BY tablename, polname;

-- Check the trigger was created:
-- SELECT trigger_name, event_manipulation, event_object_table
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public'
--   AND trigger_name = 'on_auth_user_created';

-- Verify realtime is enabled:
-- SELECT pubname, tablename
-- FROM pg_publication_tables
-- WHERE pubname = 'supabase_realtime'
--   AND tablename = 'notices';
