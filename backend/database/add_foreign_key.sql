-- =====================================================
-- ADD FOREIGN KEY CONSTRAINT TO SALES REPORTS
-- =====================================================
-- This script adds the missing foreign key constraint between sales_reports and farmers tables
-- Run this on your existing database to fix the relationship issue

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_sales_reports_farmer' 
        AND table_name = 'sales_reports'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE public.sales_reports 
        ADD CONSTRAINT fk_sales_reports_farmer 
        FOREIGN KEY (farmer_id) REFERENCES public.farmers(farmer_id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint added successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- Verify the constraint was added
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'sales_reports'
    AND tc.constraint_name = 'fk_sales_reports_farmer';
