-- =====================================================
-- ADD VERIFICATION FIELDS TO BUYERS TABLE
-- =====================================================
-- Run this in Supabase SQL Editor
-- Adds photo, ID, and verification tracking fields for buyers
-- =====================================================

-- Add photo and ID fields for verification
ALTER TABLE public.buyers 
ADD COLUMN IF NOT EXISTS profile_photo TEXT,
ADD COLUMN IF NOT EXISTS valid_id_photo TEXT,
ADD COLUMN IF NOT EXISTS business_permit_photo TEXT,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES association_officers(officer_id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for verification status
CREATE INDEX IF NOT EXISTS idx_buyers_verification_status ON buyers(verification_status);

-- Add comments
COMMENT ON COLUMN buyers.profile_photo IS 'URL or base64 of buyer/owner profile photo';
COMMENT ON COLUMN buyers.valid_id_photo IS 'URL or base64 of valid ID for verification';
COMMENT ON COLUMN buyers.business_permit_photo IS 'URL or base64 of business permit/license';
COMMENT ON COLUMN buyers.verification_status IS 'Status: pending, verified, rejected';
COMMENT ON COLUMN buyers.verified_by IS 'Officer who verified/rejected the buyer';
COMMENT ON COLUMN buyers.verified_at IS 'Timestamp when verification was done';
COMMENT ON COLUMN buyers.rejection_reason IS 'Reason for rejection if status is rejected';

-- Verify columns were added
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'buyers' 
  AND column_name IN ('profile_photo', 'valid_id_photo', 'business_permit_photo', 'verification_status', 'verified_by', 'verified_at', 'rejection_reason')
ORDER BY ordinal_position;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- Buyers can now upload:
-- 1. Profile photo (owner's photo)
-- 2. Valid ID photo (owner's ID)
-- 3. Business permit/license photo (PhilFIDA, DTI, etc.)
--
-- Verification workflow:
-- 1. Buyer registers → verification_status = 'pending'
-- 2. Admin reviews → can verify or reject
-- 3. If verified → verification_status = 'verified', is_verified = true
-- 4. If rejected → verification_status = 'rejected', rejection_reason filled
-- =====================================================
