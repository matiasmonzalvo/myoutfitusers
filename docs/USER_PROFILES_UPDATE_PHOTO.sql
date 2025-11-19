-- =====================================================
-- USER PROFILE PHOTO - SQL UPDATE
-- =====================================================
-- This script adds profile photo support to user_profiles
-- Run this after USER_PROFILES_SETUP.sql

-- =====================================================
-- 1. ADD PROFILE PHOTO COLUMN
-- =====================================================
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- =====================================================
-- 2. STORAGE BUCKET FOR PROFILE PHOTOS
-- =====================================================
-- Go to Supabase Dashboard -> Storage -> Create new bucket
-- 
-- Bucket: "profile-photos"
--   - Public: YES (so profile photos can be displayed)
--   - File size limit: 5MB
--   - Allowed MIME types: image/jpeg, image/png, image/webp

-- =====================================================
-- 3. STORAGE POLICIES FOR profile-photos (Public)
-- =====================================================

-- Users can upload their own profile photos
CREATE POLICY "Users can upload own profile photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Anyone can view profile photos (public)
CREATE POLICY "Profile photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- Users can update their own profile photos
CREATE POLICY "Users can update own profile photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own profile photos
CREATE POLICY "Users can delete own profile photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

