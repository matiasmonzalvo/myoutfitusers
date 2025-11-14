# 🎨 Avatar Generation System - Installation Guide

## 📋 Overview

This system allows users to upload photos and generate personalized 3D avatars using Google's Gemini AI.

---

## 🚀 Installation Steps

### 1️⃣ Install NPM Package

Run this command in your terminal:

```bash
npm install @google/genai
```

### 2️⃣ Set up Supabase Storage

#### A. Create Buckets

1. Go to **Supabase Dashboard** → **Storage**
2. Click **Create bucket**

**Bucket 1: `user-photos`**

- Name: `user-photos`
- Public: **NO** (Private)
- File size limit: 10MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

**Bucket 2: `user-avatars`**

- Name: `user-avatars`
- Public: **YES** (Public)
- File size limit: 10MB
- Allowed MIME types: `image/jpeg, image/png, image/webp`

#### B. Run SQL Script

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `docs/AVATAR_GENERATION_SETUP.sql`
3. Copy and paste the entire content
4. Click **Run**

This will:

- Add `avatar_regenerations_left` column
- Create storage policies
- Create helper functions

### 3️⃣ Set up Google Gemini API Key

#### A. Get API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Get API Key**
3. Copy your API key

#### B. Add to Environment Variables

Add this to your `.env.local` file:

```env
GOOGLE_GEMINI_API_KEY=your_api_key_here
```

**Important:** Never commit this file to git!

---

## 🔧 Configuration

### Environment Variables Required

```env
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini API (NEW)
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key
```

---

## 🧪 Testing

### Test the Avatar Generation

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Create a new user account at `/register`

3. Complete the first step of onboarding (profile)

4. Upload two photos:
   - Full body photo
   - Face photo

5. Click **Create Avatar**

6. Wait for the avatar to generate (this may take 10-30 seconds)

7. You can regenerate up to 3 times

8. Click **Complete Setup** to finish

---

## 📁 Files Created/Modified

### New Files

- `app/api/generate-avatar/route.ts` - API endpoint for avatar generation
- `docs/AVATAR_GENERATION_SETUP.sql` - SQL setup script
- `docs/AVATAR_GENERATION_INSTALLATION.md` - This guide

### Modified Files

- `components/auth/onboarding-form.tsx` - Multi-step onboarding with photo upload
- `lib/types/user.ts` - Added `avatar_regenerations_left` field

---

## 🔄 How It Works

```
1. User completes profile (Step 1)
   ↓
2. User uploads 2 photos (Step 2)
   - Full body photo
   - Face photo
   - Optional notes
   ↓
3. Photos sent to API as base64
   ↓
4. API calls Google Gemini AI
   - Sends both images
   - Sends profile data (age, gender, height, weight, body type)
   - Sends system prompt
   ↓
5. Gemini generates 3D avatar
   ↓
6. Avatar saved to Supabase Storage
   ↓
7. User sees preview (Step 3)
   - Can regenerate (max 3 times)
   - Can complete setup
   ↓
8. Avatar URL saved to profile
   ↓
9. Onboarding complete! 🎉
```

---

## ⚙️ Regeneration Limits

Each user has **3 regenerations** by default:

- First generation: Free (uses 1)
- Regeneration 1: Uses 1 (2 left)
- Regeneration 2: Uses 1 (1 left)
- Regeneration 3: Uses 1 (0 left)
- After 0: Button disabled

The counter is tracked in `user_profiles.avatar_regenerations_left`

---

## 🎨 Customizing the Avatar Prompt

You can modify the AI prompt in `app/api/generate-avatar/route.ts`:

```typescript
const systemPrompt = `You are an expert AI avatar generator...`;
```

Tips for better prompts:

- Be specific about style (photorealistic, cartoon, 3D, etc.)
- Mention lighting and quality requirements
- Include body type descriptions
- Specify output format and resolution

---

## 🐛 Troubleshooting

### Error: "Authentication required"

**Solution:** Make sure user is logged in

### Error: "No regenerations left"

**Solution:** User has used all 3 regenerations. You can reset by updating the database:

```sql
UPDATE user_profiles
SET avatar_regenerations_left = 3
WHERE id = 'user_id_here';
```

### Error: "Failed to upload avatar"

**Solution:** Check that `user-avatars` bucket exists and is public

### Error: "Both images are required"

**Solution:** Make sure both photos are uploaded before clicking "Create Avatar"

### API Key Issues

**Solution:**

- Verify `GOOGLE_GEMINI_API_KEY` is set in `.env.local`
- Restart your development server after adding the key
- Check that the API key is valid

### Slow Generation

**Solution:**

- Avatar generation can take 10-30 seconds
- This is normal for AI image generation
- Show a loading spinner to users (already implemented)

---

## 💰 Pricing

### Google Gemini API

Check current pricing at: [Google AI Studio Pricing](https://ai.google.dev/pricing)

As of now:

- Gemini 2.5 Flash Image: Check official pricing
- Free tier available for development

### Supabase Storage

- Free tier: 1GB storage
- Paid: $0.021 per GB per month
- Bandwidth: Free tier 2GB, then $0.09 per GB

---

## 🔐 Security Notes

1. **API Key:** Never expose `GOOGLE_GEMINI_API_KEY` in client-side code
2. **Storage:** User photos are private, avatars are public
3. **Rate Limiting:** Consider adding rate limiting to prevent abuse
4. **Validation:** Always validate image sizes and types

---

## 📊 Database Schema

```sql
user_profiles
├── id (UUID)
├── username (VARCHAR)
├── ...
├── avatar_url (TEXT) ← Generated avatar URL
├── avatar_regenerations_left (INTEGER) ← Regeneration counter
├── onboarding_completed (BOOLEAN)
└── ...
```

---

## 🎯 Next Steps

After installation, you can:

1. **Customize the avatar style** by modifying the AI prompt
2. **Add more regenerations** by updating the default value
3. **Implement avatar editing** features
4. **Add avatar gallery** to show all generated avatars
5. **Allow manual avatar upload** as an alternative

---

## 📞 Support

If you encounter issues:

1. Check Supabase logs in Dashboard
2. Check browser console (F12)
3. Check Next.js server logs
4. Verify all environment variables are set
5. Ensure SQL scripts were executed successfully

---

## ✅ Quick Checklist

- [ ] Install `@google/genai` package
- [ ] Create `user-photos` bucket in Supabase (private)
- [ ] Create `user-avatars` bucket in Supabase (public)
- [ ] Run `AVATAR_GENERATION_SETUP.sql`
- [ ] Get Google Gemini API key
- [ ] Add `GOOGLE_GEMINI_API_KEY` to `.env.local`
- [ ] Restart development server
- [ ] Test avatar generation with a new user
- [ ] Verify regeneration limits work
- [ ] Confirm avatar URL is saved to profile

---

**🎉 You're all set! Users can now generate personalized avatars!**
