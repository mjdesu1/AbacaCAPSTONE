-- =====================================================
-- OPTIMIZE SEEDLINGS TABLE PERFORMANCE
-- =====================================================
-- Purpose: Add indexes for faster queries
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_seedlings_recipient_farmer 
ON public.seedlings(recipient_farmer_id);

CREATE INDEX IF NOT EXISTS idx_seedlings_status 
ON public.seedlings(status);

CREATE INDEX IF NOT EXISTS idx_seedlings_date_distributed 
ON public.seedlings(date_distributed DESC);

CREATE INDEX IF NOT EXISTS idx_seedlings_variety 
ON public.seedlings(variety);

CREATE INDEX IF NOT EXISTS idx_seedlings_distributed_by 
ON public.seedlings(distributed_by);

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_seedlings_farmer_status 
ON public.seedlings(recipient_farmer_id, status);

CREATE INDEX IF NOT EXISTS idx_seedlings_status_date 
ON public.seedlings(status, date_distributed DESC);

-- =====================================================
-- VERIFY INDEXES
-- =====================================================
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'seedlings'
ORDER BY indexname;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- Indexes created for better query performance
-- Queries should be much faster now
-- =====================================================
