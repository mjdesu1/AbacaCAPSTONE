-- =====================================================
-- CREATE SUPER ADMIN AND ADMIN ACCOUNTS
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- This creates both Super Admin and Regular Admin accounts
-- =====================================================

-- First, ensure the is_super_admin column exists
ALTER TABLE public.association_officers 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Add index if not exists
CREATE INDEX IF NOT EXISTS idx_officers_is_super_admin 
ON public.association_officers(is_super_admin);

-- =====================================================
-- SUPER ADMIN ACCOUNT
-- =====================================================
-- Email: superadmin@mao.gov.ph
-- Password: SuperAdmin123!@#
-- Hash generated with: bcrypt.hash('SuperAdmin123!@#', 10)

-- Delete existing super admin if exists
DELETE FROM association_officers WHERE email = 'superadmin@mao.gov.ph';

INSERT INTO association_officers (
    officer_id,
    full_name,
    position,
    association_name,
    contact_number,
    email,
    address,
    term_start_date,
    term_end_date,
    term_duration,
    farmers_under_supervision,
    password_hash,
    is_active,
    is_verified,
    profile_completed,
    is_super_admin,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'Super Administrator',
    'System Administrator',
    'MAO Culiram',
    '09171234567',
    'superadmin@mao.gov.ph',
    'Municipal Agriculture Office, Culiram, Prosperidad, Agusan del Sur',
    '2024-01-01',
    '2027-12-31',
    '2024-2027',
    0,
    '$2b$10$zB7r3qDotuIs74T/qQpuw.2nWml8ZJn5V8sFhk1hO2ZjVK.8rcLgC', -- SuperAdmin123!@#
    true,
    true,
    true,
    true, -- THIS IS THE SUPER ADMIN FLAG
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- =====================================================
-- REGULAR ADMIN ACCOUNT
-- =====================================================
-- Email: admin@mao.gov.ph
-- Password: Admin123!@#
-- Hash generated with: bcrypt.hash('Admin123!@#', 10)

-- Delete existing admin if exists
DELETE FROM association_officers WHERE email = 'admin@mao.gov.ph';

INSERT INTO association_officers (
    officer_id,
    full_name,
    position,
    association_name,
    contact_number,
    email,
    address,
    term_start_date,
    term_end_date,
    term_duration,
    farmers_under_supervision,
    password_hash,
    is_active,
    is_verified,
    profile_completed,
    is_super_admin,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'MAO Administrator',
    'Municipal Agriculture Officer',
    'MAO Culiram',
    '09187654321',
    'admin@mao.gov.ph',
    'Municipal Agriculture Office, Culiram, Prosperidad, Agusan del Sur',
    '2024-01-01',
    '2027-12-31',
    '2024-2027',
    0,
    '$2b$10$UeyNVRtBJ08yuPD3dtNkpOGrepxH2Pgf6qx6NS5NucdHxeV61uOn2', -- Admin123!@#
    true,
    true,
    true,
    false, -- THIS IS A REGULAR ADMIN (NOT SUPER ADMIN)
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- =====================================================
-- VERIFY THE ACCOUNTS WERE CREATED
-- =====================================================
SELECT 
    officer_id,
    full_name,
    position,
    email,
    is_active,
    is_verified,
    is_super_admin,
    profile_completed,
    created_at
FROM association_officers
WHERE email IN ('superadmin@mao.gov.ph', 'admin@mao.gov.ph')
ORDER BY is_super_admin DESC;

-- =====================================================
-- ACCOUNT SUMMARY
-- =====================================================
-- 
-- 1. SUPER ADMIN ACCOUNT
--    Email: superadmin@mao.gov.ph
--    Password: SuperAdmin123!@#
--    Access: Full system access + can login during maintenance
--    
-- 2. REGULAR ADMIN ACCOUNT
--    Email: admin@mao.gov.ph
--    Password: Admin123!@#
--    Access: Regular officer access (CANNOT login during maintenance)
--
-- =====================================================
-- IMPORTANT NOTES
-- =====================================================
-- 1. Only Super Admin (is_super_admin = true) can login during maintenance
-- 2. Regular Admin (is_super_admin = false) cannot login during maintenance
-- 3. Change these passwords after first login for security
-- 4. The password hashes above are pre-generated for convenience
-- =====================================================
