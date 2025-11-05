-- =====================================================
-- ADD PHOTO FIELDS TO SEEDLINGS TABLE
-- =====================================================
-- Purpose: Add photo storage for seedling images
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add photo columns to seedlings table
ALTER TABLE public.seedlings
ADD COLUMN IF NOT EXISTS seedling_photo TEXT,           -- Main photo of the seedlings
ADD COLUMN IF NOT EXISTS packaging_photo TEXT,          -- Photo of packaging/distribution
ADD COLUMN IF NOT EXISTS quality_photo TEXT;            -- Photo showing quality/condition

-- Add comment to describe the columns
COMMENT ON COLUMN public.seedlings.seedling_photo IS 'Base64 encoded image or URL of the seedling photo';
COMMENT ON COLUMN public.seedlings.packaging_photo IS 'Base64 encoded image or URL of the packaging photo';
COMMENT ON COLUMN public.seedlings.quality_photo IS 'Base64 encoded image or URL of the quality inspection photo';

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Check if columns were added successfully
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'seedlings'
  AND table_schema = 'public'
  AND column_name IN ('seedling_photo', 'packaging_photo', 'quality_photo')
ORDER BY ordinal_position;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- Photo columns added to seedlings table
-- You can now upload seedling photos
-- =====================================================
