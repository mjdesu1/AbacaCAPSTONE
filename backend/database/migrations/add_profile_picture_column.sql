-- Migration: Add profile_picture column to association_officers table
-- Date: 2025-10-31
-- Description: Add profile_picture column to store profile image URLs

-- Add profile_picture column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'association_officers' 
        AND column_name = 'profile_picture'
    ) THEN
        ALTER TABLE association_officers 
        ADD COLUMN profile_picture TEXT;
        
        RAISE NOTICE 'Column profile_picture added successfully';
    ELSE
        RAISE NOTICE 'Column profile_picture already exists';
    END IF;
END $$;

-- Add comment to column
COMMENT ON COLUMN association_officers.profile_picture IS 'URL to profile picture (optional, can be set during creation or profile completion)';
