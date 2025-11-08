-- =====================================================
-- Add Verification Fields to Association Officers
-- =====================================================
-- This migration adds verification fields to association_officers
-- to support admin approval workflow similar to farmers and buyers
-- =====================================================

-- Step 1: Add verification fields if they don't exist
ALTER TABLE public.association_officers 
ADD COLUMN IF NOT EXISTS verification_status VARCHAR DEFAULT 'pending' 
CHECK (verification_status IN ('pending', 'verified', 'rejected'));

ALTER TABLE public.association_officers 
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.association_officers(officer_id);

ALTER TABLE public.association_officers 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.association_officers 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE public.association_officers 
ADD COLUMN IF NOT EXISTS profile_photo TEXT;

ALTER TABLE public.association_officers 
ADD COLUMN IF NOT EXISTS valid_id_photo TEXT;

-- Step 2: Update is_verified to match verification_status for existing records
UPDATE public.association_officers 
SET verification_status = 'verified' 
WHERE is_verified = true AND verification_status = 'pending';

UPDATE public.association_officers 
SET verification_status = 'pending' 
WHERE is_verified = false AND verification_status != 'rejected';

-- Step 3: Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_association_officers_verification_status 
ON public.association_officers(verification_status);

CREATE INDEX IF NOT EXISTS idx_association_officers_verified_by 
ON public.association_officers(verified_by);

-- Step 4: Add comments
COMMENT ON COLUMN public.association_officers.verification_status IS 'Verification status: pending (awaiting admin approval), verified (approved by admin), rejected (denied by admin)';
COMMENT ON COLUMN public.association_officers.verified_by IS 'Officer ID of the admin/super admin who verified this officer';
COMMENT ON COLUMN public.association_officers.verified_at IS 'Timestamp when the officer was verified';
COMMENT ON COLUMN public.association_officers.rejection_reason IS 'Reason for rejection if verification_status is rejected';
COMMENT ON COLUMN public.association_officers.profile_photo IS 'Base64 encoded profile photo';
COMMENT ON COLUMN public.association_officers.valid_id_photo IS 'Base64 encoded valid ID photo';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Association officers now have verification workflow:
-- 1. Officer registers (verification_status = 'pending')
-- 2. Admin/Super Admin reviews and approves/rejects
-- 3. Officer can login only after verification_status = 'verified'
-- =====================================================
