-- =====================================================
-- ADD BRAND_USERNAME FIELD TO BRANDS TABLE
-- =====================================================
-- This script adds the brand_username field to the brands table
-- Run this in your Supabase SQL Editor

-- Add brand_username column to brands table
ALTER TABLE brands ADD COLUMN IF NOT EXISTS brand_username VARCHAR(50) UNIQUE;

-- Create index for brand_username for better search performance
CREATE INDEX IF NOT EXISTS idx_brands_username ON brands(brand_username);

-- Update existing brands with a default username based on brand_name
-- This will create usernames like "nike", "adidas", etc.
UPDATE brands 
SET brand_username = LOWER(REPLACE(REPLACE(REPLACE(brand_name, ' ', ''), '-', ''), '_', ''))
WHERE brand_username IS NULL;

-- Make brand_username NOT NULL after updating existing records
ALTER TABLE brands ALTER COLUMN brand_username SET NOT NULL;

-- Add a check constraint to ensure brand_username follows username format
ALTER TABLE brands ADD CONSTRAINT check_brand_username_format 
CHECK (brand_username ~ '^[a-z0-9_]+$' AND LENGTH(brand_username) >= 3);

-- Add a trigger to automatically generate brand_username if not provided
CREATE OR REPLACE FUNCTION generate_brand_username()
RETURNS TRIGGER AS $$
BEGIN
  -- If brand_username is not provided, generate one from brand_name
  IF NEW.brand_username IS NULL OR NEW.brand_username = '' THEN
    NEW.brand_username := LOWER(REPLACE(REPLACE(REPLACE(NEW.brand_name, ' ', ''), '-', ''), '_', ''));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic username generation
CREATE TRIGGER trigger_generate_brand_username
  BEFORE INSERT ON brands
  FOR EACH ROW
  EXECUTE FUNCTION generate_brand_username();

-- Update RLS policies to allow public access to brand_username
-- (This should already be covered by the existing "Anyone can view active brands" policy)
