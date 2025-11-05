-- =====================================================
-- ADD PLANTING TRACKING TO SEEDLINGS
-- =====================================================
-- Purpose: Allow farmers to mark seedlings as planted
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add planting tracking fields
ALTER TABLE public.seedlings
ADD COLUMN IF NOT EXISTS planting_date DATE,                           -- When farmer planted
ADD COLUMN IF NOT EXISTS planting_location TEXT,                       -- Where planted (farm location)
ADD COLUMN IF NOT EXISTS planting_photo_1 TEXT,                        -- Planting photo 1
ADD COLUMN IF NOT EXISTS planting_photo_2 TEXT,                        -- Planting photo 2
ADD COLUMN IF NOT EXISTS planting_photo_3 TEXT,                        -- Planting photo 3
ADD COLUMN IF NOT EXISTS planting_notes TEXT,                          -- Farmer's notes
ADD COLUMN IF NOT EXISTS planted_by UUID REFERENCES public.farmers(farmer_id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS planted_at TIMESTAMP WITH TIME ZONE;          -- Timestamp when marked as planted

-- Add comments
COMMENT ON COLUMN public.seedlings.planting_date IS 'Date when farmer planted the seedlings';
COMMENT ON COLUMN public.seedlings.planting_location IS 'Location where seedlings were planted';
COMMENT ON COLUMN public.seedlings.planting_photo_1 IS 'Photo of planted seedlings (1)';
COMMENT ON COLUMN public.seedlings.planting_photo_2 IS 'Photo of planted seedlings (2)';
COMMENT ON COLUMN public.seedlings.planting_photo_3 IS 'Photo of planted seedlings (3)';
COMMENT ON COLUMN public.seedlings.planting_notes IS 'Farmer notes about planting';
COMMENT ON COLUMN public.seedlings.planted_at IS 'Timestamp when farmer marked as planted';

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'seedlings'
  AND table_schema = 'public'
  AND column_name LIKE 'planting%' OR column_name = 'planted_by' OR column_name = 'planted_at'
ORDER BY ordinal_position;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- Planting tracking fields added
-- Farmers can now mark seedlings as planted
-- =====================================================
