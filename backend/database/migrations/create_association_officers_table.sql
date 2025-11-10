-- =====================================================
-- Create Association Officers Table
-- =====================================================
-- This table is for farmer association officers
-- (President, Vice President, Treasurer, etc.)
-- Separate from government MAO officers (organization table)
-- =====================================================

-- Create association_officers table
CREATE TABLE IF NOT EXISTS public.association_officers (
  officer_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  full_name character varying(255) NOT NULL,
  email character varying(255) NOT NULL UNIQUE,
  password_hash character varying(255) NOT NULL,
  position character varying(100),
  association_name character varying(255),
  contact_number character varying(20),
  address text,
  term_start_date date,
  term_end_date date,
  term_duration character varying(50),
  farmers_under_supervision integer DEFAULT 0,
  profile_picture text,
  valid_id_photo text,
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  verification_status character varying DEFAULT 'pending'::character varying,
  verified_by uuid,
  verified_at timestamp with time zone,
  rejection_reason text,
  remarks text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  last_login timestamp with time zone,
  CONSTRAINT association_officers_pkey PRIMARY KEY (officer_id),
  CONSTRAINT association_officers_email_key UNIQUE (email),
  CONSTRAINT association_officers_verification_status_check CHECK (
    verification_status IN ('pending', 'verified', 'rejected')
  ),
  CONSTRAINT association_officers_verified_by_fkey FOREIGN KEY (verified_by) 
    REFERENCES public.organization(officer_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_association_officers_email 
ON public.association_officers(email);

CREATE INDEX IF NOT EXISTS idx_association_officers_association_name 
ON public.association_officers(association_name);

CREATE INDEX IF NOT EXISTS idx_association_officers_position 
ON public.association_officers(position);

CREATE INDEX IF NOT EXISTS idx_association_officers_verification_status 
ON public.association_officers(verification_status);

CREATE INDEX IF NOT EXISTS idx_association_officers_verified_by 
ON public.association_officers(verified_by);

-- Create trigger for updated_at
CREATE TRIGGER update_association_officers_updated_at 
BEFORE UPDATE ON public.association_officers 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.association_officers IS 'Farmer association officers (President, Vice President, Treasurer, etc.)';
COMMENT ON COLUMN public.association_officers.position IS 'Position in the association (e.g., President, Vice President, Treasurer)';
COMMENT ON COLUMN public.association_officers.association_name IS 'Name of the farmer association';
COMMENT ON COLUMN public.association_officers.term_start_date IS 'Start date of the officer term';
COMMENT ON COLUMN public.association_officers.term_end_date IS 'End date of the officer term';
COMMENT ON COLUMN public.association_officers.term_duration IS 'Duration of the term (e.g., 2024-2027)';
COMMENT ON COLUMN public.association_officers.farmers_under_supervision IS 'Number of farmers under this officer supervision';
COMMENT ON COLUMN public.association_officers.verified_by IS 'MAO officer who verified this association officer';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
