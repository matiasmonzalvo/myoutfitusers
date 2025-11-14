-- =====================================================
-- OUTFITS SYSTEM - SQL SCHEMA
-- =====================================================
-- This script creates the outfits table and storage bucket
-- Run this in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. STORAGE BUCKET FOR OUTFITS
-- =====================================================
-- Create a public bucket for outfit images
INSERT INTO storage.buckets (id, name, public)
VALUES ('outfits', 'outfits', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. OUTFITS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  image_url TEXT NOT NULL, -- URL de la imagen del outfit guardada en storage
  products JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de productos usados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- 3. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_outfits_created_at ON outfits(created_at DESC);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on outfits table
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own outfits
CREATE POLICY "Users can read own outfits"
ON outfits
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own outfits
CREATE POLICY "Users can insert own outfits"
ON outfits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own outfits
CREATE POLICY "Users can update own outfits"
ON outfits
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own outfits
CREATE POLICY "Users can delete own outfits"
ON outfits
FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 5. STORAGE POLICIES
-- =====================================================

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload own outfits"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'outfits' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone can view outfit images (public bucket)
CREATE POLICY "Anyone can view outfits"
ON storage.objects
FOR SELECT
USING (bucket_id = 'outfits');

-- Policy: Users can update their own outfit images
CREATE POLICY "Users can update own outfits"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'outfits' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own outfit images
CREATE POLICY "Users can delete own outfits"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'outfits' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_outfits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER outfits_updated_at
BEFORE UPDATE ON outfits
FOR EACH ROW
EXECUTE FUNCTION update_outfits_updated_at();

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to get user's outfits count
CREATE OR REPLACE FUNCTION get_user_outfits_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM outfits WHERE user_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

