-- =====================================================
-- Add Maintenance Mode System
-- =====================================================
-- This migration adds support for system maintenance mode
-- Only MAO officers can toggle maintenance mode ON/OFF
-- =====================================================

-- Step 1: Create system_settings table for maintenance mode
CREATE TABLE IF NOT EXISTS public.system_settings (
    setting_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.association_officers(officer_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Insert default maintenance mode setting (OFF by default)
INSERT INTO public.system_settings (
    setting_key,
    setting_value,
    description
) VALUES (
    'maintenance_mode',
    'false',
    'System maintenance mode status. true = maintenance ON, false = maintenance OFF'
) ON CONFLICT (setting_key) DO NOTHING;

-- Step 3: Create maintenance_logs table to track who turned it on/off
CREATE TABLE IF NOT EXISTS public.maintenance_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(20) NOT NULL CHECK (action IN ('enabled', 'disabled')),
    enabled_by UUID REFERENCES public.association_officers(officer_id),
    reason TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_created ON public.maintenance_logs(created_at DESC);

-- Step 5: Add comments
COMMENT ON TABLE public.system_settings IS 'System-wide settings including maintenance mode';
COMMENT ON TABLE public.maintenance_logs IS 'Audit log for maintenance mode changes';
COMMENT ON COLUMN public.system_settings.setting_key IS 'Unique key for the setting (e.g., maintenance_mode)';
COMMENT ON COLUMN public.system_settings.setting_value IS 'Value of the setting (stored as text, parse as needed)';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Maintenance mode is now available!
-- Default status: OFF (maintenance_mode = false)
-- MAO officers can toggle this via dashboard
-- =====================================================
