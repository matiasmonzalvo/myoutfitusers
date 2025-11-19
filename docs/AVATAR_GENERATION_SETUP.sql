-- =====================================================
-- AVATAR GENERATION - SQL UPDATES
-- =====================================================
-- Run this AFTER executing USER_PROFILES_SETUP.sql

-- =====================================================
-- 1. ADD REGENERATION TRACKING COLUMN
-- =====================================================
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS avatar_regenerations_left INTEGER DEFAULT 3 NOT NULL;

-- =====================================================
-- 2. STORAGE BUCKETS (Run these in Supabase Dashboard)
-- =====================================================
-- Go to Storage -> Create new bucket
-- 
-- Bucket 1: "user-photos"
--   - Public: NO (private)
--   - File size limit: 10MB
--   - Allowed MIME types: image/jpeg, image/png, image/webp
--
-- Bucket 2: "user-avatars" 
--   - Public: YES (so avatars can be displayed)
--   - File size limit: 10MB
--   - Allowed MIME types: image/jpeg, image/png, image/webp

-- =====================================================
-- 3. STORAGE POLICIES FOR user-photos (Private)
-- =====================================================
-- Users can upload their own photos
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can read their own photos
CREATE POLICY "Users can read own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own photos
CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 4. STORAGE POLICIES FOR user-avatars (Public read)
-- =====================================================
-- Anyone can read avatars (public)
CREATE POLICY "Anyone can read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars');

-- Users can upload their own avatars
CREATE POLICY "Users can upload own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- 5. AVATAR HISTORY TABLE
-- =====================================================
-- Table to store all generated avatars for each user
CREATE TABLE IF NOT EXISTS avatar_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_url TEXT NOT NULL,
  is_selected BOOLEAN DEFAULT false NOT NULL,
  generation_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_avatar_history_user_id ON avatar_history(user_id);
CREATE INDEX IF NOT EXISTS idx_avatar_history_selected ON avatar_history(user_id, is_selected);

-- Enable RLS
ALTER TABLE avatar_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own avatar history
CREATE POLICY "Users can read own avatar history"
ON avatar_history
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own avatar history
CREATE POLICY "Users can insert own avatar history"
ON avatar_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own avatar history
CREATE POLICY "Users can update own avatar history"
ON avatar_history
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own avatar history
CREATE POLICY "Users can delete own avatar history"
ON avatar_history
FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 6. FUNCTION TO DECREMENT REGENERATIONS
-- =====================================================
CREATE OR REPLACE FUNCTION decrement_avatar_regenerations(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  remaining INTEGER;
BEGIN
  UPDATE user_profiles 
  SET avatar_regenerations_left = GREATEST(avatar_regenerations_left - 1, 0)
  WHERE id = user_id
  RETURNING avatar_regenerations_left INTO remaining;
  
  RETURN remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

