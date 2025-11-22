# Profile Photo Setup Guide

This guide explains how to set up profile photo functionality for user accounts.

## 🎯 Overview

Users can now upload a profile photo that will be displayed in the navigation header. This is separate from the AI-generated avatar used in the app.

## 📋 Prerequisites

- Supabase project set up
- `user_profiles` table already created
- Admin access to Supabase Dashboard

## 🗄️ Database Setup

### Step 1: Update user_profiles Table

Run the SQL script in your Supabase SQL Editor:

**File:** `docs/USER_PROFILES_UPDATE_PHOTO.sql`

This will:
- Add `profile_photo_url` column to `user_profiles` table
- Set up storage policies for the `profile-photos` bucket

```sql
-- Add profile photo column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
```

### Step 2: Create Storage Bucket

1. Go to Supabase Dashboard → **Storage**
2. Click **"Create a new bucket"**
3. Configure the bucket:
   - **Name:** `profile-photos`
   - **Public bucket:** ✅ YES (so profile photos can be displayed)
   - **File size limit:** 5MB
   - **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`

### Step 3: Set up Storage Policies

Run these policies in your Supabase SQL Editor:

```sql
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
```

## ✅ Verification

### Test the Setup

1. Navigate to `/settings` in your app
2. Go to the **Profile** tab
3. Click **"Upload Photo"**
4. Select an image (PNG, JPG, or WEBP, max 5MB)
5. The preview should update immediately
6. Click **"Save Changes"**
7. The photo should upload and appear in the navigation header

### Check Storage

1. Go to Supabase Dashboard → Storage → `profile-photos`
2. You should see folders named with user IDs
3. Each folder contains a `profile.[ext]` file

## 🔧 How It Works

### Upload Flow

1. User selects a photo in `/settings`
2. Client-side validation checks file type and size
3. Preview is generated using FileReader API
4. On save, the photo is uploaded to `profile-photos/{userId}/profile.{ext}`
5. The public URL is saved to `user_profiles.profile_photo_url`
6. CardLayout displays the photo in the avatar component

### File Storage Structure

```
profile-photos/
├── {user-id-1}/
│   └── profile.jpg
├── {user-id-2}/
│   └── profile.png
└── {user-id-3}/
    └── profile.webp
```

### Display Priority

The avatar component displays photos in this order:
1. **Profile photo** (`profile_photo_url`) ← Highest priority
2. OAuth avatar (`user.user_metadata.avatar_url`)
3. OAuth picture (`user.user_metadata.picture`)
4. User initials fallback

## 🎨 Features

### Profile Settings Page (`/settings`)

- **Profile Tab:**
  - Upload profile photo
  - Change username (with availability check)
  - View email (read-only)
  
- **Theme Tab:**
  - Light mode
  - Dark mode
  - System mode (auto)
  
- **Base Avatar Tab:**
  - Coming soon placeholder

### Key Behaviors

- ✅ Real-time preview when selecting photo
- ✅ Automatic validation (type, size)
- ✅ Old photos are replaced on new upload
- ✅ Photo displays immediately in header after save
- ✅ Works with page refresh
- ✅ Responsive design (mobile + desktop)

## 🚨 Troubleshooting

### Photo Not Uploading

**Check:**
- Bucket `profile-photos` exists and is public
- Storage policies are correctly set up
- File is less than 5MB
- File is PNG, JPG, or WEBP

**Solution:**
```sql
-- Verify bucket exists
SELECT * FROM storage.buckets WHERE name = 'profile-photos';

-- Check policies
SELECT * FROM storage.policies WHERE bucket_id = 'profile-photos';
```

### Photo Not Displaying

**Check:**
- `profile_photo_url` is saved in database
- URL is accessible (try opening in browser)
- Browser cache (hard refresh with Ctrl+Shift+R)

**Solution:**
```sql
-- Check if URL is saved
SELECT id, profile_photo_url FROM user_profiles WHERE id = 'your-user-id';
```

### Permission Errors

**Check:**
- User is authenticated
- RLS policies are enabled
- User ID matches folder name in storage

**Solution:**
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'user_profiles';

-- Should return: rowsecurity = true
```

## 📝 TypeScript Types

The `UserProfile` interface includes the new field:

```typescript
export interface UserProfile {
  id: string;
  username: string;
  // ... other fields
  profile_photo_url: string | null; // ← New field
  // ... more fields
}
```

## 🔐 Security Notes

1. **Public Access:** Profile photos are publicly accessible by design
2. **User Isolation:** Users can only upload/delete their own photos
3. **File Validation:** Client and server validate file types and sizes
4. **Storage Path:** Files are organized by user ID for security
5. **Automatic Cleanup:** Old photos are deleted when uploading new ones

## 📊 Storage Considerations

- Average photo size: ~500KB - 2MB
- 1000 users = ~500MB - 2GB storage
- Supabase free tier: 1GB storage
- Paid tier: $0.021/GB/month

## 🎯 Next Steps

After setup, users can:
1. Go to Settings → Profile
2. Upload their profile photo
3. See it appear in the navigation header
4. Update it anytime

The photo will persist across sessions and devices.

---

**Need Help?** Check the Supabase documentation or review the source code in:
- `app/settings/page.tsx` - Settings page component
- `components/CardLayout.tsx` - Header avatar display
- `lib/types/user.ts` - TypeScript types







