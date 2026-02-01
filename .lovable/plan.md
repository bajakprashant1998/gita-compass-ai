
# Fix: ElevenLabs TTS Edge Function - RLS Bypass Issue

## Problem Identified
The edge function `elevenlabs-tts` cannot read from the `admin_settings` table because:
1. It uses `SUPABASE_ANON_KEY` to create the database client
2. The `admin_settings` table has RLS policy requiring `has_role(auth.uid(), 'admin'::app_role)`
3. Anonymous connections cannot pass this check, so the query returns empty results
4. The function thinks no API key is configured

## Solution
Change both edge functions to use `SUPABASE_SERVICE_ROLE_KEY` instead of `SUPABASE_ANON_KEY` when reading admin settings. The service role key bypasses RLS, allowing server-side access to configuration.

## Test Results (Current State)
- **Gemini AI (admin-ai-generate)**: Working - Returns proper transliteration
- **ElevenLabs TTS (elevenlabs-tts)**: Failing - Returns "API key not configured"

## Files to Modify

### 1. `supabase/functions/elevenlabs-tts/index.ts`
Change line 49 from:
```typescript
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
```
To:
```typescript
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
```

And update line 52:
```typescript
const settings = await getAdminSettings(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
```

### 2. `supabase/functions/admin-ai-generate/index.ts`
Same fix - change the key used in `getAdminSettings()` call from `SUPABASE_ANON_KEY` to `SUPABASE_SERVICE_ROLE_KEY`

## Why This Works
- `SUPABASE_SERVICE_ROLE_KEY` is automatically available in all edge functions
- Service role connections bypass Row Level Security (RLS)
- Admin settings are sensitive and should only be read server-side anyway
- This is the standard pattern for server-side configuration access

## After Fix - Verification Steps
1. Deploy both edge functions
2. Test ElevenLabs TTS with sample text
3. Verify Gemini AI continues to work
4. Test from Admin Settings page Voice tab

