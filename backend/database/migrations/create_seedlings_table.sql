-- =====================================================
-- CREATE SEEDLINGS TABLE
-- =====================================================
-- Purpose: Track seedling distribution and inventory
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create seedlings table
CREATE TABLE IF NOT EXISTS public.seedlings (
  -- Primary Key
  seedling_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Seedling Information
  variety VARCHAR(100) NOT NULL,                    -- Variety/Type of Abaca
  source_supplier VARCHAR(200),                     -- Source/Supplier
  quantity_distributed INTEGER NOT NULL CHECK (quantity_distributed > 0),
  date_distributed DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Recipient Information
  recipient_farmer_id UUID REFERENCES public.farmers(farmer_id) ON DELETE SET NULL,
  recipient_association VARCHAR(200),               -- Association name if distributed to group
  
  -- Additional Information
  remarks TEXT,                                     -- e.g., healthy, damaged, replanted
  status VARCHAR(50) DEFAULT 'distributed',         -- distributed, planted, damaged, etc.
  
  -- Tracking
  distributed_by UUID REFERENCES public.association_officers(officer_id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_seedlings_farmer ON public.seedlings(recipient_farmer_id);
CREATE INDEX IF NOT EXISTS idx_seedlings_date ON public.seedlings(date_distributed);
CREATE INDEX IF NOT EXISTS idx_seedlings_variety ON public.seedlings(variety);
CREATE INDEX IF NOT EXISTS idx_seedlings_status ON public.seedlings(status);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_seedlings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS seedlings_updated_at_trigger ON public.seedlings;
CREATE TRIGGER seedlings_updated_at_trigger
  BEFORE UPDATE ON public.seedlings
  FOR EACH ROW
  EXECUTE FUNCTION update_seedlings_updated_at();

-- Disable RLS for development (enable in production with proper policies)
ALTER TABLE public.seedlings DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
/*
INSERT INTO public.seedlings (
  variety,
  source_supplier,
  quantity_distributed,
  date_distributed,
  recipient_association,
  remarks,
  status
) VALUES
  ('Musa Textilis (Native)', 'PhilFIDA Nursery', 500, '2025-01-15', 'CuSAFA', 'Healthy seedlings, ready for planting', 'distributed'),
  ('Tangongon', 'Local Supplier - Prosperidad', 300, '2025-01-20', 'SAAD Farmers', 'Good quality, disease-free', 'distributed'),
  ('Laylay', 'MAO Nursery', 200, '2025-02-01', 'Barangay San Jose Farmers', 'Some minor damage during transport', 'distributed');
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'seedlings'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'seedlings'
  AND schemaname = 'public';

-- Count seedlings
SELECT COUNT(*) as total_seedlings FROM public.seedlings;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- Seedlings table created successfully
-- Ready for seedling distribution tracking
-- =====================================================
