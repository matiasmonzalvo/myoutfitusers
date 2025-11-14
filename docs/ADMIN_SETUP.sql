-- =====================================================
-- OUTFITTERS ADMIN SYSTEM - SQL SCHEMA
-- =====================================================
-- This script creates the necessary tables for the brand admin system
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. BRANDS TABLE
-- =====================================================
-- Stores brand information and credentials
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, -- Stored securely via Supabase Auth
  logo_url TEXT,
  description TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  contact_person VARCHAR(255),
  phone VARCHAR(50)
);

-- =====================================================
-- 2. PRODUCTS TABLE
-- =====================================================
-- Stores product information for each brand
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  
  -- Product basic info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  
  -- Product images (stored in Supabase Storage)
  images TEXT[] NOT NULL, -- Array of image URLs from Storage
  
  -- Product link
  product_link TEXT, -- Link to buy the product
  
  -- Category (upper/lower/accessory/foot)
  category VARCHAR(50) NOT NULL CHECK (category IN ('upper', 'lower', 'accessory', 'foot')),
  
  -- Subcategory for more specific classification
  subcategory VARCHAR(100), -- e.g., 'shirt', 'pants', 'sneakers', 'hat', etc.
  
  -- 3D Model / AR support (for future implementation)
  model_3d_url TEXT, -- URL to 3D model file
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  stock_status VARCHAR(50) DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- 3. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_brands_email ON brands(email);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON brands(is_active);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on brands table
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Brands can only read their own data
CREATE POLICY "Brands can view own data" ON brands
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Policy: Brands can update their own data
CREATE POLICY "Brands can update own data" ON brands
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Policy: Brands can only manage their own products
CREATE POLICY "Brands can view own products" ON products
  FOR SELECT
  USING (brand_id::text = auth.uid()::text);

CREATE POLICY "Brands can insert own products" ON products
  FOR INSERT
  WITH CHECK (brand_id::text = auth.uid()::text);

CREATE POLICY "Brands can update own products" ON products
  FOR UPDATE
  USING (brand_id::text = auth.uid()::text);

CREATE POLICY "Brands can delete own products" ON products
  FOR DELETE
  USING (brand_id::text = auth.uid()::text);

-- Policy: Anyone can view active products (for users browsing)
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT
  USING (is_active = true);

-- Policy: Anyone can view active brands (for users browsing)
CREATE POLICY "Anyone can view active brands" ON brands
  FOR SELECT
  USING (is_active = true);

-- =====================================================
-- 5. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for brands table
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for products table
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. STORAGE BUCKETS & POLICIES
-- =====================================================
-- Create storage buckets for brand logos and product images
-- Note: You need to create these buckets manually in Supabase Dashboard first
-- Then run these policies

-- IMPORTANT: Before running these policies, create the buckets in Supabase Dashboard:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create bucket: "brand-logos" (Public bucket)
-- 3. Create bucket: "product-images" (Public bucket)

-- =====================================================
-- STORAGE POLICIES FOR BRAND LOGOS
-- =====================================================

-- Allow brands to upload their own logos
CREATE POLICY "Brands can upload own logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'brand-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow brands to update their own logos
CREATE POLICY "Brands can update own logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'brand-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow brands to delete their own logos
CREATE POLICY "Brands can delete own logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'brand-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to view brand logos (public access)
CREATE POLICY "Anyone can view brand logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'brand-logos');

-- =====================================================
-- STORAGE POLICIES FOR PRODUCT IMAGES
-- =====================================================

-- Allow brands to upload product images to their folder
CREATE POLICY "Brands can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow brands to update their product images
CREATE POLICY "Brands can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow brands to delete their product images
CREATE POLICY "Brands can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to view product images (public access)
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- =====================================================
-- 7. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================
-- Uncomment to insert sample data

/*
-- Insert a sample brand (you'll need to create this via Supabase Auth first)
INSERT INTO brands (id, brand_name, email, password_hash, description, website_url)
VALUES (
  'your-brand-uuid-here',
  'Nike',
  'admin@nike.com',
  'handled-by-supabase-auth',
  'Just Do It - Leading sportswear brand',
  'https://www.nike.com'
);

-- Insert sample products
INSERT INTO products (brand_id, name, description, price, images, product_link, category, subcategory)
VALUES 
  (
    'your-brand-uuid-here',
    'Air Max 90',
    'Classic Nike sneakers with Air cushioning',
    129.99,
    ARRAY['https://your-project.supabase.co/storage/v1/object/public/product-images/brand-id/product1.jpg'],
    'https://nike.com/airmax90',
    'foot',
    'sneakers'
  ),
  (
    'your-brand-uuid-here',
    'Dri-FIT T-Shirt',
    'Moisture-wicking performance t-shirt',
    35.00,
    ARRAY['https://your-project.supabase.co/storage/v1/object/public/product-images/brand-id/product2.jpg'],
    'https://nike.com/dri-fit-tshirt',
    'upper',
    'shirt'
  );
*/

