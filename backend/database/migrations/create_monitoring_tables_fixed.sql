-- =====================================================
-- Field Monitoring System Database Schema (Supabase Compatible)
-- Purpose: Record field monitoring and updates for crop growth, production, and farmer activity
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create monitoring_records table
CREATE TABLE IF NOT EXISTS public.monitoring_records (
    -- Primary Key
    monitoring_id VARCHAR(50) PRIMARY KEY,
    
    -- Visit Information
    date_of_visit DATE NOT NULL,
    monitored_by VARCHAR(255) NOT NULL,
    monitored_by_role VARCHAR(100),
    
    -- Farmer Information
    farmer_id UUID,
    farmer_name VARCHAR(255) NOT NULL,
    association_name VARCHAR(255),
    farm_location TEXT,
    
    -- Farm Assessment
    farm_condition VARCHAR(50) NOT NULL CHECK (farm_condition IN ('Healthy', 'Needs Support', 'Damaged')),
    growth_stage VARCHAR(50) NOT NULL CHECK (growth_stage IN (
        'Land Preparation',
        'Planting',
        'Seedling',
        'Vegetative',
        'Mature',
        'Ready for Harvest',
        'Harvesting',
        'Post-Harvest'
    )),
    
    -- Issues and Actions
    issues_observed TEXT[],
    other_issues TEXT,
    actions_taken TEXT NOT NULL,
    recommendations TEXT NOT NULL,
    
    -- Next Monitoring
    next_monitoring_date DATE NOT NULL,
    
    -- Additional Information
    weather_condition VARCHAR(100),
    estimated_yield DECIMAL(10, 2),
    remarks TEXT,
    
    -- Photos (optional)
    photo_urls TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT check_visit_date CHECK (date_of_visit <= CURRENT_DATE),
    CONSTRAINT check_next_monitoring CHECK (next_monitoring_date > date_of_visit)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_monitoring_farmer_id ON public.monitoring_records(farmer_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_date_of_visit ON public.monitoring_records(date_of_visit);
CREATE INDEX IF NOT EXISTS idx_monitoring_next_date ON public.monitoring_records(next_monitoring_date);
CREATE INDEX IF NOT EXISTS idx_monitoring_farm_condition ON public.monitoring_records(farm_condition);
CREATE INDEX IF NOT EXISTS idx_monitoring_growth_stage ON public.monitoring_records(growth_stage);
CREATE INDEX IF NOT EXISTS idx_monitoring_created_at ON public.monitoring_records(created_at);

-- Create monitoring_issues table
CREATE TABLE IF NOT EXISTS public.monitoring_issues (
    issue_id SERIAL PRIMARY KEY,
    issue_name VARCHAR(100) UNIQUE NOT NULL,
    issue_category VARCHAR(50),
    description TEXT,
    severity_level VARCHAR(20) CHECK (severity_level IN ('Low', 'Medium', 'High', 'Critical')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common issues
INSERT INTO public.monitoring_issues (issue_name, issue_category, severity_level) VALUES
    ('Pest Infestation', 'Pest & Disease', 'High'),
    ('Disease', 'Pest & Disease', 'High'),
    ('Flood Damage', 'Weather', 'Critical'),
    ('Drought', 'Weather', 'High'),
    ('Low Yield', 'Production', 'Medium'),
    ('Soil Issues', 'Soil', 'Medium'),
    ('Weed Overgrowth', 'Maintenance', 'Low'),
    ('Nutrient Deficiency', 'Soil', 'Medium'),
    ('Poor Drainage', 'Infrastructure', 'Medium'),
    ('Weather Damage', 'Weather', 'High'),
    ('Equipment Issues', 'Infrastructure', 'Low'),
    ('Labor Shortage', 'Management', 'Medium')
ON CONFLICT (issue_name) DO NOTHING;

-- Create monitoring_statistics view
CREATE OR REPLACE VIEW public.monitoring_statistics AS
SELECT 
    COUNT(*) as total_monitoring,
    COUNT(*) FILTER (WHERE farm_condition = 'Healthy') as healthy_farms,
    COUNT(*) FILTER (WHERE farm_condition = 'Needs Support') as needs_support,
    COUNT(*) FILTER (WHERE farm_condition = 'Damaged') as damaged_farms,
    COUNT(*) FILTER (WHERE next_monitoring_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days') as upcoming_monitoring,
    COUNT(*) FILTER (WHERE next_monitoring_date < CURRENT_DATE) as overdue_monitoring,
    AVG(estimated_yield) as average_estimated_yield,
    COUNT(DISTINCT farmer_id) as total_farmers_monitored
FROM public.monitoring_records;

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_monitoring_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS monitoring_updated_at_trigger ON public.monitoring_records;
CREATE TRIGGER monitoring_updated_at_trigger
    BEFORE UPDATE ON public.monitoring_records
    FOR EACH ROW
    EXECUTE FUNCTION update_monitoring_updated_at();

-- Disable RLS for development (enable in production with proper policies)
ALTER TABLE public.monitoring_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_issues DISABLE ROW LEVEL SECURITY;

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
WHERE table_name = 'monitoring_records'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'monitoring_records'
    AND schemaname = 'public';

-- Count monitoring records
SELECT COUNT(*) as total_records FROM public.monitoring_records;

-- View statistics
SELECT * FROM public.monitoring_statistics;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- Monitoring system tables created successfully
-- Ready for field monitoring tracking
-- =====================================================
