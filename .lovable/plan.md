

# Fix TTS: Switch from ElevenLabs to Google Cloud Text-to-Speech

## Problem Identified

The edge function logs show the **ElevenLabs account has exceeded its quota and is blocked**:

```
"status":"quota_exceeded","message":"This request exceeds your quota of 10000. You have 1361 credits remaining..."
"status":"detected_unusual_activity","message":"Unusual activity detected. Free Tier usage disabled..."
```

This explains why TTS works in admin (cached/different text) but fails on the public verse page with "Invalid ElevenLabs API key" error (the error message is misleading - it's actually a quota/abuse block).

## Solution

Since you've provided a Gemini API key (`AIzaSyAiNQVwsZy6CRTCXEppljE7qT2TzvKfouA`), we'll switch to **Google Cloud Text-to-Speech** which is available through the same Google Cloud project.

## Implementation Steps

### 1. Create Google TTS Edge Function

**New file**: `supabase/functions/google-tts/index.ts`

This function will:
- Use Google Cloud TTS REST API: `https://texttospeech.googleapis.com/v1/text:synthesize`
- Accept text, language code, and voice settings
- Return base64-encoded MP3 audio
- Support English (en-US) and Hindi (hi-IN) voices for Sanskrit content

### 2. Add Google TTS Settings to Database

Add new settings for Google TTS:
- `google_tts_api_key` - Your Gemini API key (same for all Google Cloud services)
- `google_tts_voice_en` - English voice (e.g., `en-US-Neural2-D`)
- `google_tts_voice_hi` - Hindi voice for Sanskrit (e.g., `hi-IN-Neural2-B`)
- `tts_provider` - Switch between `google` and `elevenlabs`

### 3. Update ModernStory Component

Modify `src/components/shlok/ModernStory.tsx` to:
- Call the new `google-tts` edge function instead of `elevenlabs-tts`
- Parse the JSON response with base64 audio content
- Create audio from base64 data URI

### 4. Update Admin Settings

Modify `src/lib/adminSettings.ts` to add:
- `generateGoogleTTS()` function
- `testGoogleTTSConnection()` function

### 5. Update Admin Settings UI (Optional)

Add Google TTS configuration section in `src/pages/admin/AdminSettings.tsx` for:
- Voice selection
- Provider toggle (Google vs ElevenLabs)

---

## Technical Details

### Google TTS API Request

```typescript
const response = await fetch(
  `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text: "Your text here" },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Neural2-D'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0
      }
    })
  }
);
// Returns: { audioContent: "base64-encoded-audio" }
```

### Recommended Voices

| Language | Voice | Description |
|----------|-------|-------------|
| English | `en-US-Neural2-D` | Male, warm narrator |
| English | `en-US-Neural2-F` | Female, clear |
| Hindi | `hi-IN-Neural2-B` | Male, good for Sanskrit |
| Hindi | `hi-IN-Wavenet-A` | Female, high quality |

### Database Migration

```sql
INSERT INTO admin_settings (key, value, description, is_secret) VALUES
  ('google_tts_api_key', 'AIzaSyAiNQVwsZy6CRTCXEppljE7qT2TzvKfouA', 'Google Cloud TTS API key', true),
  ('google_tts_voice_en', 'en-US-Neural2-D', 'Default English voice', false),
  ('google_tts_voice_hi', 'hi-IN-Neural2-B', 'Default Hindi/Sanskrit voice', false),
  ('tts_provider', 'google', 'Active TTS provider (google or elevenlabs)', false)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/google-tts/index.ts` | **Create** | New edge function for Google TTS |
| `src/components/shlok/ModernStory.tsx` | **Modify** | Switch to Google TTS endpoint |
| `src/lib/adminSettings.ts` | **Modify** | Add Google TTS helper functions |
| Database migration | **Create** | Add Google TTS settings |

---

## Benefits

1. **Immediate Fix**: Bypasses ElevenLabs quota/block issue
2. **Good Quality**: Google Neural2 voices are high quality
3. **Hindi Support**: Native Hindi voices for better Sanskrit pronunciation
4. **Same API Key**: Uses your existing Gemini API key
5. **Cost-Effective**: Generally more affordable than ElevenLabs

