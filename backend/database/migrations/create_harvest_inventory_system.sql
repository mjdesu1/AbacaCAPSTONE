-- =====================================================
-- Harvest and Inventory Management System
-- Purpose: Track abaca harvests from farmers and MAO inventory management
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. HARVESTS TABLE (Farmer submissions)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.harvests (
    -- Primary Key
    harvest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 1) Farm / Location Identification (Auto-populated from farmer profile)
    farmer_id UUID NOT NULL REFERENCES public.farmers(farmer_id) ON DELETE CASCADE,
    county_province VARCHAR(255), -- Auto-filled from farmer.address
    municipality VARCHAR(255), -- Auto-filled from farmer.municipality
    barangay VARCHAR(255), -- Auto-filled from farmer.barangay
    farm_coordinates TEXT, -- GPS coordinates (lat, long) or location description
    landmark TEXT,
    farm_name VARCHAR(255),
    farm_code VARCHAR(100),
    area_hectares DECIMAL(10, 4) NOT NULL,
    plot_lot_id VARCHAR(100),
    
    -- 2) Farmer / Responsible Information (Auto-populated from farmer profile)
    farmer_name VARCHAR(255), -- Auto-filled from farmer.full_name
    farmer_contact VARCHAR(50), -- Auto-filled from farmer.contact_number
    farmer_email VARCHAR(255),
    cooperative_name VARCHAR(255), -- Auto-filled from farmer.association_name
    mao_registration VARCHAR(100),
    farmer_registration_id VARCHAR(100),
    
    -- 3) Planting and Variety Info
    abaca_variety VARCHAR(100) NOT NULL, 
    planting_date DATE NOT NULL,
    planting_material_source VARCHAR(100) NOT NULL CHECK (planting_material_source IN ('Sucker', 'Corm', 'Tissue Culture', 'Other')),
    planting_density_hills_per_ha INTEGER,
    planting_spacing VARCHAR(50), -- e.g., "2m x 2m"
    
    -- 4) Harvest Details (CORE)
    harvest_date DATE NOT NULL,
    harvest_shift VARCHAR(100),
    harvest_crew_name VARCHAR(255),
    harvest_crew_id VARCHAR(100),
    harvest_method VARCHAR(100) NOT NULL CHECK (harvest_method IN ('Manual Tuxying + Hand Stripping', 'Mechanical Stripping', 'MSSM', 'Other')),
    stalks_harvested INTEGER,
    tuxies_collected INTEGER,
    wet_weight_kg DECIMAL(10, 2),
    dry_fiber_output_kg DECIMAL(10, 2),
    estimated_fiber_recovery_percent DECIMAL(5, 2),
    yield_per_hectare_kg DECIMAL(10, 2),
    
    -- 5) Quality / Grading / Processing
    fiber_grade VARCHAR(50), -- grade code/class
    fiber_length_cm DECIMAL(5, 2),
    fiber_color VARCHAR(50),
    fiber_fineness VARCHAR(50),
    fiber_cleanliness VARCHAR(50),
    moisture_status VARCHAR(50) CHECK (moisture_status IN ('Sun-dried', 'Semi-dried', 'Wet', 'Other')),
    defects_noted TEXT[], -- array of defects
    has_mold BOOLEAN DEFAULT FALSE,
    has_discoloration BOOLEAN DEFAULT FALSE,
    has_pest_damage BOOLEAN DEFAULT FALSE,
    stripper_operator_name VARCHAR(255),
    bales_produced INTEGER,
    weight_per_bale_kg DECIMAL(10, 2),
    
    -- 6) Inputs / Costs / Labor
    fertilizer_applied TEXT,
    fertilizer_application_date DATE,
    fertilizer_quantity VARCHAR(100),
    pesticide_applied TEXT,
    pesticide_application_date DATE,
    pesticide_quantity VARCHAR(100),
    labor_hours DECIMAL(10, 2),
    number_of_workers INTEGER,
    harvesting_cost_per_kg DECIMAL(10, 2),
    harvesting_cost_per_ha DECIMAL(10, 2),
    total_harvesting_cost DECIMAL(10, 2),
    
    -- 7) Pest / Disease / Remarks
    pests_observed BOOLEAN DEFAULT FALSE,
    pests_description TEXT,
    diseases_observed BOOLEAN DEFAULT FALSE,
    diseases_description TEXT,
    remarks TEXT,
    photo_urls TEXT[], -- array of photo URLs
    
    -- 8) Verification / Signatures
    inspected_by VARCHAR(255),
    inspector_position VARCHAR(100),
    inspection_date DATE,
    farmer_signature_url TEXT,
    farmer_thumbmark_url TEXT,
    receiving_buyer_trader VARCHAR(255),
    buyer_contact VARCHAR(50),
    
    -- Status and Workflow
    status VARCHAR(50) DEFAULT 'Pending Verification' CHECK (status IN (
        'Pending Verification',
        'Verified',
        'Rejected',
        'In Inventory',
        'Delivered',
        'Sold'
    )),
    verification_notes TEXT,
    verified_by UUID, -- MAO officer who verified
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_harvest_date CHECK (harvest_date <= CURRENT_DATE),
    CONSTRAINT check_planting_before_harvest CHECK (planting_date <= harvest_date),
    CONSTRAINT check_positive_area CHECK (area_hectares > 0),
    CONSTRAINT check_positive_weights CHECK (
        (wet_weight_kg IS NULL OR wet_weight_kg >= 0) AND
        (dry_fiber_output_kg IS NULL OR dry_fiber_output_kg >= 0)
    )
);

-- Create indexes for harvests
CREATE INDEX IF NOT EXISTS idx_harvests_farmer_id ON public.harvests(farmer_id);
CREATE INDEX IF NOT EXISTS idx_harvests_harvest_date ON public.harvests(harvest_date);
CREATE INDEX IF NOT EXISTS idx_harvests_status ON public.harvests(status);
CREATE INDEX IF NOT EXISTS idx_harvests_municipality ON public.harvests(municipality);
CREATE INDEX IF NOT EXISTS idx_harvests_barangay ON public.harvests(barangay);
CREATE INDEX IF NOT EXISTS idx_harvests_variety ON public.harvests(abaca_variety);
CREATE INDEX IF NOT EXISTS idx_harvests_created_at ON public.harvests(created_at);

-- =====================================================
-- 2. INVENTORY TABLE (MAO Management)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.inventory (
    -- Primary Key
    inventory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- MAO Information
    mao_id UUID NOT NULL, -- MAO officer managing inventory
    mao_name VARCHAR(255) NOT NULL,
    
    -- Harvest Reference
    harvest_id UUID NOT NULL REFERENCES public.harvests(harvest_id) ON DELETE CASCADE,
    
    -- Stock Information
    stock_weight_kg DECIMAL(10, 2) NOT NULL,
    current_stock_kg DECIMAL(10, 2) NOT NULL, -- tracks remaining stock after distributions
    fiber_grade VARCHAR(50) NOT NULL,
    fiber_quality_rating VARCHAR(50) CHECK (fiber_quality_rating IN ('Excellent', 'Good', 'Fair', 'Poor')),
    
    -- Storage Information
    storage_location VARCHAR(255),
    warehouse_section VARCHAR(100),
    storage_condition VARCHAR(50) CHECK (storage_condition IN ('Dry', 'Humid', 'Controlled', 'Open Air')),
    storage_temperature_celsius DECIMAL(5, 2),
    storage_humidity_percent DECIMAL(5, 2),
    
    -- Inventory Status
    status VARCHAR(50) DEFAULT 'Stocked' CHECK (status IN (
        'Stocked',
        'Reserved',
        'Partially Distributed',
        'Fully Distributed',
        'Damaged',
        'Expired',
        'Under Inspection'
    )),
    
    -- Quality Control
    quality_check_date DATE,
    quality_checked_by VARCHAR(255),
    quality_notes TEXT,
    expiry_date DATE,
    
    -- Distribution Tracking
    total_distributed_kg DECIMAL(10, 2) DEFAULT 0,
    number_of_distributions INTEGER DEFAULT 0,
    last_distribution_date DATE,
    
    -- Pricing (optional)
    unit_price_per_kg DECIMAL(10, 2),
    total_value DECIMAL(12, 2),
    
    -- Remarks
    remarks TEXT,
    photo_urls TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_positive_stock CHECK (stock_weight_kg > 0),
    CONSTRAINT check_current_stock_valid CHECK (current_stock_kg >= 0 AND current_stock_kg <= stock_weight_kg),
    CONSTRAINT check_distributed_valid CHECK (total_distributed_kg >= 0 AND total_distributed_kg <= stock_weight_kg)
);

-- Create indexes for inventory
CREATE INDEX IF NOT EXISTS idx_inventory_mao_id ON public.inventory(mao_id);
CREATE INDEX IF NOT EXISTS idx_inventory_harvest_id ON public.inventory(harvest_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_grade ON public.inventory(fiber_grade);
CREATE INDEX IF NOT EXISTS idx_inventory_storage_location ON public.inventory(storage_location);
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON public.inventory(created_at);

-- =====================================================
-- 3. INVENTORY DISTRIBUTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.inventory_distributions (
    distribution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES public.inventory(inventory_id) ON DELETE CASCADE,
    
    -- Distribution Details
    distribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    distributed_to VARCHAR(255) NOT NULL, -- buyer, trader, processor
    recipient_type VARCHAR(50) CHECK (recipient_type IN ('Buyer', 'Trader', 'Processor', 'Government', 'Export', 'Other')),
    distributed_weight_kg DECIMAL(10, 2) NOT NULL,
    
    -- Pricing
    price_per_kg DECIMAL(10, 2),
    total_amount DECIMAL(12, 2),
    
    -- Distribution Info
    distributed_by UUID, -- MAO officer who created distribution
    distributor_name VARCHAR(255),
    transport_method VARCHAR(100),
    destination VARCHAR(255),
    
    -- Documentation
    delivery_receipt_number VARCHAR(100),
    invoice_number VARCHAR(100),
    remarks TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_positive_distribution CHECK (distributed_weight_kg > 0)
);

CREATE INDEX IF NOT EXISTS idx_distributions_inventory_id ON public.inventory_distributions(inventory_id);
CREATE INDEX IF NOT EXISTS idx_distributions_date ON public.inventory_distributions(distribution_date);
CREATE INDEX IF NOT EXISTS idx_distributions_recipient ON public.inventory_distributions(distributed_to);

-- =====================================================
-- 4. VIEWS AND STATISTICS
-- =====================================================

-- Harvest Statistics View
CREATE OR REPLACE VIEW public.harvest_statistics AS
SELECT 
    COUNT(*) as total_harvests,
    COUNT(*) FILTER (WHERE status = 'Pending Verification') as pending_verification,
    COUNT(*) FILTER (WHERE status = 'Verified') as verified_harvests,
    COUNT(*) FILTER (WHERE status = 'Rejected') as rejected_harvests,
    COUNT(*) FILTER (WHERE status = 'In Inventory') as in_inventory,
    COUNT(DISTINCT farmer_id) as total_farmers,
    SUM(dry_fiber_output_kg) as total_fiber_kg,
    AVG(dry_fiber_output_kg) as avg_fiber_per_harvest,
    AVG(yield_per_hectare_kg) as avg_yield_per_hectare,
    SUM(area_hectares) as total_area_harvested,
    COUNT(*) FILTER (WHERE harvest_date >= CURRENT_DATE - INTERVAL '30 days') as harvests_last_30_days,
    COUNT(*) FILTER (WHERE harvest_date >= CURRENT_DATE - INTERVAL '7 days') as harvests_last_7_days
FROM public.harvests;

-- Inventory Statistics View
CREATE OR REPLACE VIEW public.inventory_statistics AS
SELECT 
    COUNT(*) as total_inventory_items,
    SUM(current_stock_kg) as total_stock_kg,
    SUM(total_distributed_kg) as total_distributed_kg,
    COUNT(*) FILTER (WHERE status = 'Stocked') as stocked_items,
    COUNT(*) FILTER (WHERE status = 'Reserved') as reserved_items,
    COUNT(*) FILTER (WHERE status = 'Fully Distributed') as distributed_items,
    COUNT(*) FILTER (WHERE status = 'Damaged') as damaged_items,
    AVG(current_stock_kg) as avg_stock_per_item,
    SUM(total_value) as total_inventory_value,
    COUNT(DISTINCT mao_id) as total_maos_managing
FROM public.inventory;

-- Farmer Harvest Summary View
CREATE OR REPLACE VIEW public.farmer_harvest_summary AS
SELECT 
    f.farmer_id,
    f.full_name as farmer_name,
    f.municipality,
    f.barangay,
    COUNT(h.harvest_id) as total_harvests,
    SUM(h.dry_fiber_output_kg) as total_fiber_produced_kg,
    AVG(h.yield_per_hectare_kg) as avg_yield_per_hectare,
    MAX(h.harvest_date) as last_harvest_date,
    COUNT(*) FILTER (WHERE h.status = 'Pending Verification') as pending_harvests,
    COUNT(*) FILTER (WHERE h.status = 'Verified') as verified_harvests
FROM public.farmers f
LEFT JOIN public.harvests h ON f.farmer_id = h.farmer_id
GROUP BY f.farmer_id, f.full_name, f.municipality, f.barangay;

-- =====================================================
-- 5. TRIGGERS AND FUNCTIONS
-- =====================================================

-- Auto-update updated_at for harvests
CREATE OR REPLACE FUNCTION update_harvest_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS harvest_updated_at_trigger ON public.harvests;
CREATE TRIGGER harvest_updated_at_trigger
    BEFORE UPDATE ON public.harvests
    FOR EACH ROW
    EXECUTE FUNCTION update_harvest_updated_at();

-- Auto-update updated_at for inventory
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS inventory_updated_at_trigger ON public.inventory;
CREATE TRIGGER inventory_updated_at_trigger
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_updated_at();

-- Auto-update current_stock when distribution is added
CREATE OR REPLACE FUNCTION update_inventory_stock_on_distribution()
RETURNS TRIGGER AS $$
BEGIN
    -- Update inventory current stock and distribution totals
    UPDATE public.inventory
    SET 
        current_stock_kg = current_stock_kg - NEW.distributed_weight_kg,
        total_distributed_kg = total_distributed_kg + NEW.distributed_weight_kg,
        number_of_distributions = number_of_distributions + 1,
        last_distribution_date = NEW.distribution_date,
        status = CASE 
            WHEN (current_stock_kg - NEW.distributed_weight_kg) <= 0 THEN 'Fully Distributed'
            WHEN (current_stock_kg - NEW.distributed_weight_kg) < stock_weight_kg THEN 'Partially Distributed'
            ELSE status
        END
    WHERE inventory_id = NEW.inventory_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS distribution_stock_update_trigger ON public.inventory_distributions;
CREATE TRIGGER distribution_stock_update_trigger
    AFTER INSERT ON public.inventory_distributions
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_stock_on_distribution();

-- Auto-update harvest status when added to inventory
CREATE OR REPLACE FUNCTION update_harvest_status_on_inventory()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.harvests
    SET status = 'In Inventory'
    WHERE harvest_id = NEW.harvest_id AND status = 'Verified';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS inventory_harvest_status_trigger ON public.inventory;
CREATE TRIGGER inventory_harvest_status_trigger
    AFTER INSERT ON public.inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_harvest_status_on_inventory();

-- =====================================================
-- 6. ROW LEVEL SECURITY (Disabled for development)
-- =====================================================
ALTER TABLE public.harvests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_distributions DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Uncomment to insert sample data

-- INSERT INTO public.harvests (
--     county_province, municipality, barangay, area_hectares,
--     farmer_id, farmer_name, farmer_contact,
--     abaca_variety, planting_date, planting_material_source,
--     harvest_date, harvest_method, stalks_harvested,
--     dry_fiber_output_kg, yield_per_hectare_kg,
--     fiber_grade, moisture_status
-- ) VALUES (
--     'Davao del Norte', 'Asuncion', 'Poblacion', 2.5,
--     (SELECT farmer_id FROM public.farmers LIMIT 1),
--     'Juan Dela Cruz', '09171234567',
--     'Maguindanao', '2024-01-15', 'Tissue Culture',
--     '2024-11-01', 'Manual Tuxying + Hand Stripping', 150,
--     250.5, 100.2,
--     'Grade A', 'Sun-dried'
-- );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check harvests table
SELECT COUNT(*) as harvest_records FROM public.harvests;

-- Check inventory table
SELECT COUNT(*) as inventory_records FROM public.inventory;

-- View harvest statistics
SELECT * FROM public.harvest_statistics;

-- View inventory statistics
SELECT * FROM public.inventory_statistics;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- Harvest and Inventory Management System created successfully
-- Ready for farmer harvest submissions and MAO inventory tracking
-- =====================================================
