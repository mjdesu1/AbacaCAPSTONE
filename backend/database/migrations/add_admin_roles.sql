-- =====================================================
-- Add Super Admin Role Support
-- =====================================================
-- This migration adds support for Super Admin officers
-- Super Admins have full access (create accounts + maintenance)
-- Regular officers (admins) have no special access
-- =====================================================

-- Step 1: Add is_super_admin column to association_officers table
ALTER TABLE public.association_officers 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Step 2: Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_association_officers_is_super_admin 
ON public.association_officers(is_super_admin);

-- Step 3: Add comment
COMMENT ON COLUMN public.association_officers.is_super_admin IS 'Super Admin flag - true for super admin officers with full system access (create accounts + maintenance mode)';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Two officer levels now available:
-- 1. Super Admin (is_super_admin = true) - Full access + maintenance login
-- 2. Admin/Regular Officer (is_super_admin = false) - No special access
-- 
-- NEXT STEP: Run create_admin_accounts.sql to create the accounts
-- =====================================================
