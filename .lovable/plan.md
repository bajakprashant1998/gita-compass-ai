
# Enhanced AI Content Generation & Voice Integration

## Overview
This plan addresses 8 key improvements to make AI content generation more accurate, add multi-language support, and integrate ElevenLabs text-to-speech with admin-configurable API keys.

---

## 1. Make AI Content 100% Relevant to Chapter-Verse-Sanskrit

### Problem
Current prompts lack chapter/verse context, leading to generic content that may not match the specific verse.

### Solution
Update the edge function to include chapter number and verse number in all prompts:

**Changes to `supabase/functions/admin-ai-generate/index.ts`:**

- Add `chapter_number` and `verse_number` to the `GenerationRequest` interface
- Update all system prompts to reference the specific verse location
- Modify `buildPrompt()` to include verse identifier in every request

**Example enhanced prompt:**
```text
You are generating content for Bhagavad Gita Chapter 2, Verse 47.
Sanskrit: [text]
Generate the problem context for this specific verse...
```

---

## 2. Hindi-to-English Translation (Not Separate Generation)

### Problem
Currently, English meaning is generated independently from Sanskrit, not translated from Hindi.

### Solution
Add a new generation type `translate_hindi_to_english`:

- New type in edge function: `translate_hindi_to_english`
- System prompt: "Translate the following Hindi meaning to English accurately"
- UI change: After Hindi is generated/entered, show "Translate to English" button

**Flow:**
1. Enter/Generate Hindi meaning
2. Click "Translate to English" (new button)
3. AI translates Hindi content to English

---

## 3. Multi-Language Support

### Database Changes
Add a `shlok_translations` table to store translations:

```sql
CREATE TABLE shlok_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shlok_id UUID REFERENCES shloks(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  meaning TEXT,
  life_application TEXT,
  practical_action TEXT,
  modern_story TEXT,
  problem_context TEXT,
  solution_gita TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shlok_id, language_code)
);
```

### UI Changes
- Add language selector in Shlok form
- Show translation fields when non-default language selected
- AI "Translate All" button to translate from Hindi/English to selected language

---

## 4. ElevenLabs Text-to-Speech Integration

### New Edge Function
Create `supabase/functions/elevenlabs-tts/index.ts`:

```typescript
// Uses ELEVENLABS_API_KEY from admin settings
// Generates audio from Sanskrit/Hindi/English text
// Returns audio blob for playback
```

### Features
- Generate Sanskrit verse audio (voice optimized for Sanskrit)
- Generate meaning audio in Hindi/English
- Store generated audio URLs in shloks table
- Play button in shlok form to preview

---

## 5 & 6. Admin API Key Management

### New Database Table
```sql
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  is_secret BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed settings
INSERT INTO admin_settings (key, value, description) VALUES
('gemini_api_key', '', 'Google Gemini API key for AI content generation'),
('elevenlabs_api_key', '', 'ElevenLabs API key for text-to-speech'),
('ai_model', 'google/gemini-3-flash-preview', 'AI model to use'),
('ai_temperature', '0.7', 'AI temperature setting (0-1)');
```

### Security
- Encrypt sensitive values before storing
- Only admins can view/update settings
- Use Supabase secrets as fallback if admin settings empty

---

## 7 & 8. Admin Settings Pages

### New Route: `/admin/settings`

**Tabs:**
1. **AI / Gemini Settings**
   - API Key input (masked)
   - Model selector dropdown
   - Temperature slider
   - Max tokens input
   - Test connection button

2. **ElevenLabs Settings**
   - API Key input (masked)
   - Voice ID selector
   - Audio quality settings
   - Test voice button (generate sample)

3. **General Settings**
   - Default language
   - Auto-generate on save toggle
   - Bulk generation batch size

### UI Design
```text
+--------------------------------------------------+
| Settings                                          |
+--------------------------------------------------+
| [AI Content] [Voice (TTS)] [General]             |
+--------------------------------------------------+
| AI Content Generation                            |
|                                                  |
| API Key: [********************] [Show] [Test]   |
|                                                  |
| Model: [Google Gemini 3 Flash ▼]                |
|                                                  |
| Temperature: [====O====] 0.7                    |
|                                                  |
| Max Tokens:  [500]                              |
|                                                  |
| [Save Settings]                                  |
+--------------------------------------------------+
```

---

## File Changes Summary

### New Files
| File | Description |
|------|-------------|
| `supabase/functions/elevenlabs-tts/index.ts` | Text-to-speech edge function |
| `src/pages/admin/AdminSettings.tsx` | Admin settings page with tabs |
| `src/components/admin/AISettings.tsx` | Gemini configuration panel |
| `src/components/admin/VoiceSettings.tsx` | ElevenLabs configuration panel |
| `src/components/admin/GeneralSettings.tsx` | General admin settings |
| `src/lib/adminSettings.ts` | Settings CRUD functions |

### Modified Files
| File | Changes |
|------|---------|
| `supabase/functions/admin-ai-generate/index.ts` | Add chapter/verse context, add translate type, use admin API keys |
| `src/pages/admin/AdminShlokForm.tsx` | Add translate button, add TTS preview, language selector |
| `src/components/admin/AdminSidebar.tsx` | Add Settings nav item |
| `src/App.tsx` | Add `/admin/settings` route |
| `src/lib/adminApi.ts` | Add translation and TTS functions |

### Database Migrations
1. Create `admin_settings` table with AI/voice config
2. Create `shlok_translations` table for multi-language content

---

## Implementation Phases

### Phase 1: Enhanced AI Relevance
1. Update edge function prompts with chapter/verse context
2. Pass chapter_number and verse_number from frontend
3. Test with sample verses

### Phase 2: Hindi-to-English Translation
4. Add `translate_hindi_to_english` type
5. Add "Translate to English" button in Meanings tab
6. Wire up translation flow

### Phase 3: Admin Settings Infrastructure
7. Create `admin_settings` database table
8. Create settings API functions
9. Build AdminSettings page with AI tab
10. Update edge function to read from settings

### Phase 4: ElevenLabs Integration
11. Create TTS edge function
12. Add VoiceSettings component
13. Add audio preview in shlok form
14. Store/retrieve audio URLs

### Phase 5: Multi-Language Support
15. Create `shlok_translations` table
16. Add language selector to form
17. Add "Translate All" functionality
18. Display translations in public views

---

## Technical Notes

### API Key Priority
Edge functions will check in order:
1. Admin settings table (if configured)
2. Lovable API Key (default fallback)

This allows using Lovable's built-in AI while giving admins option to use their own keys.

### ElevenLabs Voice Selection
Recommended voices for this project:
- **Sanskrit**: Custom or Brian (deep, clear)
- **Hindi**: Deep voice with proper pronunciation
- **English**: George or Will (clear articulation)

### Security Considerations
- API keys stored encrypted in database
- RLS policies restrict settings to admins only
- Keys masked in UI with reveal toggle
- Test buttons verify key validity without exposing it
