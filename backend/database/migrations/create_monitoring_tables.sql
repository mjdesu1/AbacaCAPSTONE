-- =====================================================
-- Field Monitoring System Database Schema
-- Purpose: Record field monitoring and updates for crop growth, production, and farmer activity
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
    issues_observed TEXT[], -- Array of issues
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
    
    -- Foreign Keys (optional - can reference farmers table if exists)
    -- CONSTRAINT fk_farmer FOREIGN KEY (farmer_id) REFERENCES public.farmers(farmer_id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT check_visit_date CHECK (date_of_visit <= CURRENT_DATE),
    CONSTRAINT check_next_monitoring CHECK (next_monitoring_date > date_of_visit)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_monitoring_farmer_id ON public.monitoring_records(farmer_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_date_of_visit ON public.monitoring_records(date_of_visit);
CREATE INDEX IF NOT EXISTS idx_monitoring_next_date ON public.monitoring_records(next_monitoring_date);
CREATE INDEX IF NOT EXISTS idx_monitoring_farm_condition ON public.monitoring_records(farm_condition);
CREATE INDEX IF NOT EXISTS idx_monitoring_growth_stage ON public.monitoring_records(growth_stage);
CREATE INDEX IF NOT EXISTS idx_monitoring_created_at ON public.monitoring_records(created_at);

-- Create monitoring_issues table for normalized issue tracking
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

-- Create monitoring_statistics view for quick analytics
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

-- Create monitoring_history table for tracking changes
CREATE TABLE IF NOT EXISTS monitoring_history (
    history_id SERIAL PRIMARY KEY,
    monitoring_id VARCHAR(50) NOT NULL,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE')),
    changed_by VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    old_values JSONB,
    new_values JSONB,
    change_description TEXT,
    
    CONSTRAINT fk_monitoring_history FOREIGN KEY (monitoring_id) REFERENCES monitoring_records(monitoring_id) ON DELETE CASCADE
);

-- Create index for monitoring history
CREATE INDEX idx_monitoring_history_monitoring_id ON monitoring_history(monitoring_id);
CREATE INDEX idx_monitoring_history_changed_at ON monitoring_history(changed_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_monitoring_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_monitoring_updated_at
    BEFORE UPDATE ON monitoring_records
    FOR EACH ROW
    EXECUTE FUNCTION update_monitoring_updated_at();

-- Create function to log monitoring changes
CREATE OR REPLACE FUNCTION log_monitoring_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO monitoring_history (monitoring_id, action_type, changed_by, new_values, change_description)
        VALUES (NEW.monitoring_id, 'CREATE', NEW.created_by, row_to_json(NEW), 'New monitoring record created');
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO monitoring_history (monitoring_id, action_type, changed_by, old_values, new_values, change_description)
        VALUES (NEW.monitoring_id, 'UPDATE', NEW.updated_by, row_to_json(OLD), row_to_json(NEW), 'Monitoring record updated');
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO monitoring_history (monitoring_id, action_type, changed_by, old_values, change_description)
        VALUES (OLD.monitoring_id, 'DELETE', OLD.updated_by, row_to_json(OLD), 'Monitoring record deleted');
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for logging changes
CREATE TRIGGER trigger_log_monitoring_changes
    AFTER INSERT OR UPDATE OR DELETE ON monitoring_records
    FOR EACH ROW
    EXECUTE FUNCTION log_monitoring_changes();

-- Create monitoring_alerts table for notifications
CREATE TABLE IF NOT EXISTS monitoring_alerts (
    alert_id SERIAL PRIMARY KEY,
    monitoring_id VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('OVERDUE', 'UPCOMING', 'CRITICAL_CONDITION', 'ISSUE_DETECTED')),
    alert_message TEXT NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    is_read BOOLEAN DEFAULT FALSE,
    recipient_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    
    CONSTRAINT fk_monitoring_alert FOREIGN KEY (monitoring_id) REFERENCES monitoring_records(monitoring_id) ON DELETE CASCADE,
    CONSTRAINT fk_alert_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create index for alerts
CREATE INDEX idx_monitoring_alerts_recipient ON monitoring_alerts(recipient_id);
CREATE INDEX idx_monitoring_alerts_is_read ON monitoring_alerts(is_read);
CREATE INDEX idx_monitoring_alerts_created_at ON monitoring_alerts(created_at);

-- Create function to generate alerts for overdue monitoring
CREATE OR REPLACE FUNCTION generate_overdue_alerts()
RETURNS void AS $$
BEGIN
    INSERT INTO monitoring_alerts (monitoring_id, alert_type, alert_message, severity, recipient_id)
    SELECT 
        m.monitoring_id,
        'OVERDUE',
        'Monitoring for ' || m.farmer_name || ' is overdue. Scheduled date: ' || m.next_monitoring_date,
        'High',
        m.farmer_id
    FROM monitoring_records m
    WHERE m.next_monitoring_date < CURRENT_DATE
    AND NOT EXISTS (
        SELECT 1 FROM monitoring_alerts a
        WHERE a.monitoring_id = m.monitoring_id
        AND a.alert_type = 'OVERDUE'
        AND a.created_at::date = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to generate upcoming monitoring alerts
CREATE OR REPLACE FUNCTION generate_upcoming_alerts()
RETURNS void AS $$
BEGIN
    INSERT INTO monitoring_alerts (monitoring_id, alert_type, alert_message, severity, recipient_id)
    SELECT 
        m.monitoring_id,
        'UPCOMING',
        'Monitoring for ' || m.farmer_name || ' is scheduled in ' || 
        (m.next_monitoring_date - CURRENT_DATE) || ' days',
        'Medium',
        m.farmer_id
    FROM monitoring_records m
    WHERE m.next_monitoring_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    AND NOT EXISTS (
        SELECT 1 FROM monitoring_alerts a
        WHERE a.monitoring_id = m.monitoring_id
        AND a.alert_type = 'UPCOMING'
        AND a.created_at::date = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql;

-- Create monitoring_summary view for farmer dashboard
CREATE OR REPLACE VIEW farmer_monitoring_summary AS
SELECT 
    m.farmer_id,
    m.farmer_name,
    COUNT(*) as total_visits,
    MAX(m.date_of_visit) as last_visit_date,
    MIN(m.next_monitoring_date) as next_visit_date,
    m.farm_condition as current_condition,
    m.growth_stage as current_growth_stage,
    AVG(m.estimated_yield) as average_yield,
    COUNT(*) FILTER (WHERE m.farm_condition = 'Healthy') as healthy_count,
    COUNT(*) FILTER (WHERE m.farm_condition = 'Needs Support') as needs_support_count,
    COUNT(*) FILTER (WHERE m.farm_condition = 'Damaged') as damaged_count
FROM monitoring_records m
WHERE m.monitoring_id IN (
    SELECT monitoring_id 
    FROM monitoring_records mr 
    WHERE mr.farmer_id = m.farmer_id 
    ORDER BY mr.date_of_visit DESC 
    LIMIT 1
)
GROUP BY m.farmer_id, m.farmer_name, m.farm_condition, m.growth_stage;

-- Create function to get monitoring records by farmer
CREATE OR REPLACE FUNCTION get_farmer_monitoring_records(p_farmer_id VARCHAR)
RETURNS TABLE (
    monitoring_id VARCHAR,
    date_of_visit DATE,
    monitored_by VARCHAR,
    farm_condition VARCHAR,
    growth_stage VARCHAR,
    issues_observed TEXT[],
    actions_taken TEXT,
    recommendations TEXT,
    next_monitoring_date DATE,
    estimated_yield DECIMAL,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.monitoring_id,
        m.date_of_visit,
        m.monitored_by,
        m.farm_condition,
        m.growth_stage,
        m.issues_observed,
        m.actions_taken,
        m.recommendations,
        m.next_monitoring_date,
        m.estimated_yield,
        m.created_at
    FROM monitoring_records m
    WHERE m.farmer_id = p_farmer_id
    ORDER BY m.date_of_visit DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get monitoring statistics by date range
CREATE OR REPLACE FUNCTION get_monitoring_stats_by_date(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    total_monitoring BIGINT,
    healthy_farms BIGINT,
    needs_support BIGINT,
    damaged_farms BIGINT,
    average_yield DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_monitoring,
        COUNT(*) FILTER (WHERE farm_condition = 'Healthy') as healthy_farms,
        COUNT(*) FILTER (WHERE farm_condition = 'Needs Support') as needs_support,
        COUNT(*) FILTER (WHERE farm_condition = 'Damaged') as damaged_farms,
        AVG(estimated_yield) as average_yield
    FROM monitoring_records
    WHERE date_of_visit BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON monitoring_records TO authenticated;
GRANT SELECT ON monitoring_issues TO authenticated;
GRANT SELECT ON monitoring_statistics TO authenticated;
GRANT SELECT ON farmer_monitoring_summary TO authenticated;
GRANT SELECT, INSERT ON monitoring_history TO authenticated;
GRANT SELECT, INSERT, UPDATE ON monitoring_alerts TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE monitoring_records IS 'Stores field monitoring records for crop growth, production, and farmer activity tracking';
COMMENT ON COLUMN monitoring_records.monitoring_id IS 'Unique identifier for monitoring record (auto-generated format: MON-{timestamp}-{random})';
COMMENT ON COLUMN monitoring_records.date_of_visit IS 'Date when the monitoring visit was conducted';
COMMENT ON COLUMN monitoring_records.monitored_by IS 'Name of the person who conducted the monitoring (e.g., High Value Coordinator)';
COMMENT ON COLUMN monitoring_records.farm_condition IS 'Current condition of the farm: Healthy, Needs Support, or Damaged';
COMMENT ON COLUMN monitoring_records.growth_stage IS 'Current growth stage of the crop';
COMMENT ON COLUMN monitoring_records.issues_observed IS 'Array of issues observed during the visit (e.g., pest, flood, low yield)';
COMMENT ON COLUMN monitoring_records.actions_taken IS 'Actions taken during the monitoring visit';
COMMENT ON COLUMN monitoring_records.recommendations IS 'Recommendations provided to the farmer';
COMMENT ON COLUMN monitoring_records.next_monitoring_date IS 'Scheduled date for the next monitoring visit';

-- Create sample data for testing (optional)
-- Uncomment to insert sample data
/*
INSERT INTO monitoring_records (
    monitoring_id, date_of_visit, monitored_by, monitored_by_role,
    farmer_id, farmer_name, association_name, farm_location,
    farm_condition, growth_stage, issues_observed,
    actions_taken, recommendations, next_monitoring_date,
    weather_condition, estimated_yield, created_by
) VALUES (
    'MON-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-001',
    CURRENT_DATE - INTERVAL '5 days',
    'High Value Coordinator',
    'Agricultural Officer',
    'F001',
    'Juan Dela Cruz',
    'Culiram Farmers Association',
    'Barangay Culiram, Sitio 3',
    'Healthy',
    'Mature',
    ARRAY['None'],
    'Inspected crop health, checked for pests, measured growth progress.',
    'Continue current care routine. Harvest expected in 2-3 weeks.',
    CURRENT_DATE + INTERVAL '10 days',
    'Sunny',
    150.00,
    'admin'
);
*/

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Monitoring system database schema created successfully!';
    RAISE NOTICE 'Tables created: monitoring_records, monitoring_issues, monitoring_history, monitoring_alerts';
    RAISE NOTICE 'Views created: monitoring_statistics, farmer_monitoring_summary';
    RAISE NOTICE 'Functions created: update_monitoring_updated_at, log_monitoring_changes, generate_overdue_alerts, generate_upcoming_alerts, get_farmer_monitoring_records, get_monitoring_stats_by_date';
END $$;
