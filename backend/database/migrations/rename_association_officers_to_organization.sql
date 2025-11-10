-- =====================================================
-- Rename association_officers to organization
-- and update schema to focus on government organization
-- =====================================================
-- This migration renames the table and updates columns
-- to reflect the new focus on government agricultural offices
-- =====================================================

-- Step 1: Rename the table
ALTER TABLE IF EXISTS public.association_officers 
RENAME TO organization;

-- Step 2: Drop dependent views first
DROP VIEW IF EXISTS active_officers_summary CASCADE;

-- Step 3: Remove old columns that are no longer needed
ALTER TABLE public.organization 
DROP COLUMN IF EXISTS term_start_date,
DROP COLUMN IF EXISTS term_end_date,
DROP COLUMN IF EXISTS term_duration,
DROP COLUMN IF EXISTS farmers_under_supervision,
DROP COLUMN IF EXISTS association_name;

-- Step 4: Add new columns for government office information
ALTER TABLE public.organization 
ADD COLUMN IF NOT EXISTS office_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS assigned_municipality VARCHAR(255),
ADD COLUMN IF NOT EXISTS assigned_barangay VARCHAR(255);

-- Step 5: Update foreign key constraints in other tables
-- Update buyers table foreign key
ALTER TABLE public.buyers 
DROP CONSTRAINT IF EXISTS buyers_verified_by_fkey;

ALTER TABLE public.buyers 
ADD CONSTRAINT buyers_verified_by_fkey 
FOREIGN KEY (verified_by) REFERENCES public.organization(officer_id);

-- Update farmers table foreign key
ALTER TABLE public.farmers 
DROP CONSTRAINT IF EXISTS farmers_verified_by_fkey;

ALTER TABLE public.farmers 
ADD CONSTRAINT farmers_verified_by_fkey 
FOREIGN KEY (verified_by) REFERENCES public.organization(officer_id);

-- Update maintenance_logs table foreign key
ALTER TABLE public.maintenance_logs 
DROP CONSTRAINT IF EXISTS maintenance_logs_enabled_by_fkey;

ALTER TABLE public.maintenance_logs 
ADD CONSTRAINT maintenance_logs_enabled_by_fkey 
FOREIGN KEY (enabled_by) REFERENCES public.organization(officer_id);

-- Update seedlings table foreign key
ALTER TABLE public.seedlings 
DROP CONSTRAINT IF EXISTS seedlings_distributed_by_fkey;

ALTER TABLE public.seedlings 
ADD CONSTRAINT seedlings_distributed_by_fkey 
FOREIGN KEY (distributed_by) REFERENCES public.organization(officer_id);

-- Update system_settings table foreign key
ALTER TABLE public.system_settings 
DROP CONSTRAINT IF EXISTS system_settings_updated_by_fkey;

ALTER TABLE public.system_settings 
ADD CONSTRAINT system_settings_updated_by_fkey 
FOREIGN KEY (updated_by) REFERENCES public.organization(officer_id);

-- Step 6: Update indexes
DROP INDEX IF EXISTS idx_officers_email;
DROP INDEX IF EXISTS idx_officers_association;
DROP INDEX IF EXISTS idx_officers_position;
DROP INDEX IF EXISTS idx_officers_is_super_admin;
DROP INDEX IF EXISTS idx_association_officers_verification_status;
DROP INDEX IF EXISTS idx_association_officers_verified_by;

CREATE INDEX IF NOT EXISTS idx_organization_email 
ON public.organization(email);

CREATE INDEX IF NOT EXISTS idx_organization_office_name 
ON public.organization(office_name);

CREATE INDEX IF NOT EXISTS idx_organization_position 
ON public.organization(position);

CREATE INDEX IF NOT EXISTS idx_organization_is_super_admin 
ON public.organization(is_super_admin);

CREATE INDEX IF NOT EXISTS idx_organization_verification_status 
ON public.organization(verification_status);

CREATE INDEX IF NOT EXISTS idx_organization_assigned_municipality 
ON public.organization(assigned_municipality);

-- Step 7: Rename constraint names (instead of dropping and recreating)
-- Rename primary key constraint
ALTER INDEX IF EXISTS association_officers_pkey RENAME TO organization_pkey;

-- Rename unique constraint
ALTER TABLE public.organization 
RENAME CONSTRAINT association_officers_email_key TO organization_email_key;

-- Rename check constraint
ALTER TABLE public.organization 
RENAME CONSTRAINT association_officers_verification_status_check TO organization_verification_status_check;

-- Step 8: Add comments
COMMENT ON TABLE public.organization IS 'Government agricultural office personnel and organization officers';
COMMENT ON COLUMN public.organization.office_name IS 'Name of the government office (e.g., Municipal Agriculture Office, Talacogon)';
COMMENT ON COLUMN public.organization.assigned_municipality IS 'Municipality assigned to this officer';
COMMENT ON COLUMN public.organization.assigned_barangay IS 'Barangay coverage assigned to this officer';
COMMENT ON COLUMN public.organization.position IS 'Position/Designation (e.g., High Value Crops Coordinator, Agricultural Technologist)';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Table renamed from association_officers to organization
-- Removed: term_start_date, term_end_date, term_duration, 
--          farmers_under_supervision, association_name
-- Added: office_name, assigned_municipality, assigned_barangay
-- All foreign keys and indexes updated
-- =====================================================
