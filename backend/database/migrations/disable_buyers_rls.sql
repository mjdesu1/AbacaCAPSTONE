-- =====================================================
-- DISABLE RLS FOR BUYERS TABLE
-- =====================================================
-- Run this in Supabase SQL Editor
-- This allows the backend to insert buyers without RLS blocking
-- =====================================================

-- Disable Row Level Security for buyers table
ALTER TABLE public.buyers DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'buyers';

-- Expected result: rowsecurity = false

-- =====================================================
-- ALTERNATIVE: If you want to keep RLS enabled
-- =====================================================
-- Uncomment these lines to create permissive policies instead:

/*
-- Enable RLS
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for service role
CREATE POLICY "Allow all for service role"
ON public.buyers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated"
ON public.buyers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy to allow inserts for anon (registration)
CREATE POLICY "Allow insert for anon"
ON public.buyers
FOR INSERT
TO anon
WITH CHECK (true);

-- Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'buyers';
*/

-- =====================================================
-- SUCCESS!
-- =====================================================
-- Buyers can now be registered without RLS errors
-- =====================================================
