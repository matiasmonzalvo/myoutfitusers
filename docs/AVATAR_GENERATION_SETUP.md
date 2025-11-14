# Avatar Generation Setup

## Required Environment Variables

To use the avatar generation feature, you need to configure the following environment variable:

### Google Gemini API Key

Add this to your `.env.local` file:

```env
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key_here
```

## How to Get a Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key and add it to your `.env.local` file

## Troubleshooting

If you see the error "Server configuration error: Google Gemini API key not found", it means:

1. The `GOOGLE_GEMINI_API_KEY` environment variable is not set
2. The API key is invalid or expired
3. The API key doesn't have the necessary permissions

## Features

- ✅ AI-powered avatar generation using Google Gemini
- ✅ User photo upload and processing
- ✅ Physical characteristics integration
- ✅ Regeneration limits (3 attempts per user)
- ✅ Automatic image optimization and storage


