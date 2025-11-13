-- =====================================================
-- SALES REPORTING SYSTEM SCHEMA
-- =====================================================
-- This file contains the database schema for the farmer sales reporting system
-- Run this after the main schema.sql to add sales reporting functionality

-- Enable UUID extension if not already enabled
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SALES REPORTING TABLES
-- =====================================================

-- Sales Reports Table
-- Stores monthly sales reports submitted by farmers with comprehensive transaction details
CREATE TABLE public.sales_reports (
  report_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  farmer_id uuid NOT NULL,
  report_month character varying NOT NULL, -- Format: YYYY-MM
  
  -- 1. Basic Transaction Info
  transaction_reference character varying, -- Transaction ID / Reference Number
  sale_date date NOT NULL,
  buyer_company_name character varying NOT NULL,
  
  -- 2. Product Details
  abaca_type character varying NOT NULL DEFAULT 'Tuxy',
  quantity_sold numeric(10,2) NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  
  -- 3. Payment Details
  payment_method character varying DEFAULT 'cash'::character varying CHECK (payment_method::text = ANY (ARRAY['cash'::character varying, 'bank_transfer'::character varying, 'check'::character varying, 'credit'::character varying]::text[])),
  payment_status character varying DEFAULT 'paid'::character varying CHECK (payment_status::text = ANY (ARRAY['paid'::character varying, 'pending'::character varying, 'partial'::character varying]::text[])),
  
  -- 4. Logistics / Delivery
  delivery_location character varying,
  shipping_fee numeric(10,2) DEFAULT 0,
  
  -- 5. Remarks / Notes
  quality_notes text,
  other_comments text,
  
  -- Administrative fields
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying]::text[])),
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  rejection_reason text,
  submitted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT sales_reports_pkey PRIMARY KEY (report_id),
  CONSTRAINT fk_sales_reports_farmer FOREIGN KEY (farmer_id) REFERENCES public.farmers(farmer_id) ON DELETE CASCADE
);

-- =====================================================
-- SALES ANALYTICS VIEW
-- =====================================================

-- Sales Analytics View
-- Provides aggregated analytics data for farmer performance tracking
CREATE OR REPLACE VIEW public.sales_analytics AS
SELECT 
  f.farmer_id,
  f.full_name as farmer_name,
  COUNT(DISTINCT sr.report_id) as total_reports,
  COALESCE(SUM(sr.total_amount), 0) as total_revenue,
  COALESCE(SUM(sr.quantity_sold), 0) as total_quantity,
  COUNT(sr.report_id) as total_transactions,
  COALESCE(AVG(sr.unit_price), 0) as average_price_per_kg,
  MAX(sr.submitted_at) as last_report_date,
  (
    SELECT sr2.abaca_type 
    FROM public.sales_reports sr2 
    WHERE sr2.farmer_id = f.farmer_id AND sr2.status = 'approved'
    GROUP BY sr2.abaca_type 
    ORDER BY SUM(sr2.quantity_sold) DESC 
    LIMIT 1
  ) as top_abaca_type,
  COALESCE(AVG(sr.shipping_fee), 0) as average_shipping_fee
FROM public.farmers f
LEFT JOIN public.sales_reports sr ON f.farmer_id = sr.farmer_id AND sr.status = 'approved'
GROUP BY f.farmer_id, f.full_name
ORDER BY total_revenue DESC;

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Sales Reports indexes
CREATE INDEX IF NOT EXISTS idx_sales_reports_farmer_id ON public.sales_reports(farmer_id);
CREATE INDEX IF NOT EXISTS idx_sales_reports_month ON public.sales_reports(report_month);
CREATE INDEX IF NOT EXISTS idx_sales_reports_status ON public.sales_reports(status);
CREATE INDEX IF NOT EXISTS idx_sales_reports_submitted_at ON public.sales_reports(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_reports_sale_date ON public.sales_reports(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_reports_abaca_type ON public.sales_reports(abaca_type);
CREATE INDEX IF NOT EXISTS idx_sales_reports_payment_status ON public.sales_reports(payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_reports_buyer_company ON public.sales_reports(buyer_company_name);

-- =====================================================
-- ROW LEVEL SECURITY (Disabled for development)
-- =====================================================
ALTER TABLE public.sales_reports DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Uncomment the following to insert sample data for testing
/*
-- Sample comprehensive sales reports (requires existing farmer_id from farmers table)
INSERT INTO public.sales_reports (
  farmer_id, report_month, transaction_reference, sale_date, buyer_company_name,
  abaca_type, quantity_sold, unit_price, total_amount,
  payment_method, payment_status, delivery_location, shipping_fee,
  quality_notes, other_comments, status, submitted_at
) VALUES
  ('existing-farmer-uuid-1', '2024-11', 'TXN-2024-001', '2024-11-05', 'ABC Trading Corporation',
   'Tuxy', 150.50, 200.00, 30100.00,
   'bank_transfer', 'paid', 'Manila Port Area', 500.00,
   'Grade A quality, well-dried fibers', 'Delivered on time, buyer satisfied', 'approved', '2024-11-10 10:30:00'),
  
  ('existing-farmer-uuid-2', '2024-11', 'TXN-2024-002', '2024-11-08', 'XYZ Fiber Industries',
   'Superior', 120.25, 220.00, 26455.00,
   'cash', 'paid', 'Cebu Processing Plant', 300.00,
   'Premium quality, no defects found', 'Regular customer, smooth transaction', 'pending', '2024-11-08 14:15:00'),
   
  ('existing-farmer-uuid-3', '2024-11', 'TXN-2024-003', '2024-11-12', 'Local Cooperative',
   'Medium', 80.00, 180.00, 14400.00,
   'gcash', 'pending', 'Local Warehouse', 0.00,
   'Good quality for medium grade', 'Payment pending, delivery completed', 'pending', '2024-11-12 16:45:00');
*/

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.sales_reports IS 'Comprehensive monthly sales reports submitted by farmers to MAO with detailed transaction information';
COMMENT ON VIEW public.sales_analytics IS 'Aggregated analytics view for farmer performance tracking';

-- Column comments for sales_reports table
COMMENT ON COLUMN public.sales_reports.report_month IS 'Report period in YYYY-MM format';
COMMENT ON COLUMN public.sales_reports.transaction_reference IS 'Unique transaction ID or reference number provided by farmer';
COMMENT ON COLUMN public.sales_reports.buyer_company_name IS 'Name of the company or individual who purchased the abaca';
COMMENT ON COLUMN public.sales_reports.abaca_type IS 'Type/grade of abaca - farmers can input any custom type (e.g., Tuxy, Superior, Medium, Low Grade, Custom grades)';
COMMENT ON COLUMN public.sales_reports.quantity_sold IS 'Total quantity of abaca sold in kilograms';
COMMENT ON COLUMN public.sales_reports.unit_price IS 'Price per kilogram in Philippine Pesos';
COMMENT ON COLUMN public.sales_reports.total_amount IS 'Total transaction amount (quantity × unit price)';
COMMENT ON COLUMN public.sales_reports.payment_method IS 'Payment method: cash, bank_transfer, check, or credit';
COMMENT ON COLUMN public.sales_reports.payment_status IS 'Payment status: paid, pending, or partial';
COMMENT ON COLUMN public.sales_reports.delivery_location IS 'Destination where the abaca was delivered';
COMMENT ON COLUMN public.sales_reports.shipping_fee IS 'Transportation or shipping cost in Philippine Pesos';
COMMENT ON COLUMN public.sales_reports.quality_notes IS 'Notes about the condition and quality of the abaca';
COMMENT ON COLUMN public.sales_reports.other_comments IS 'Additional comments, instructions, or special notes';
COMMENT ON COLUMN public.sales_reports.status IS 'Report approval status: pending, approved, or rejected by MAO';
