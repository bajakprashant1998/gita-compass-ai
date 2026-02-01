

# AI Text Generator for Admin Panel

## Overview
Add AI-powered content generation buttons throughout the admin panel to help generate transliterations, meanings, stories, and solutions. This will use Lovable AI (via a new edge function) to significantly speed up content entry for all 701 shloks.

---

## New Edge Function

### `supabase/functions/admin-ai-generate/index.ts`

A single edge function that handles multiple generation types based on the request:

| Type | Input | Output |
|------|-------|--------|
| `transliteration` | Sanskrit text | IAST transliteration |
| `hindi_meaning` | Sanskrit text + context | Hindi meaning |
| `english_meaning` | Sanskrit text + context | English meaning |
| `problem_context` | Verse content | Problem this verse addresses |
| `solution_gita` | Verse content | Gita-based solution |
| `life_application` | Verse content | Practical life application |
| `practical_action` | Verse content | Specific action steps |
| `modern_story` | Verse content + story type | 200-300 word modern story |
| `suggest_story_type` | Story content | Suggested story type (corporate/family/youth/global) |
| `chapter_description` | Chapter title + theme | English and Hindi descriptions |
| `suggest_problems` | Verse content | Suggested problem tags with scores |

---

## UI Components

### 1. Reusable AI Generate Button

**New Component:** `src/components/admin/AIGenerateButton.tsx`

```text
+-------------------------------------------+
| [Sparkles Icon] Generate with AI | Loading |
+-------------------------------------------+
```

Features:
- Loading spinner during generation
- Disabled state when no input
- Success/error toast feedback
- Works inline with any textarea or input

---

## AdminShlokForm.tsx Enhancements

### Tab 1: Core Information
Add AI button under **Transliteration** field:
```text
Sanskrit Text: [textarea]
Transliteration: [textarea]
                 [Generate Transliteration] <- AI button
```

### Tab 2: Meanings
Add AI buttons next to each meaning field:
```text
+------------------------+------------------------+
| Hindi Meaning          | English Meaning *      |
| [textarea]             | [textarea]             |
| [Generate Hindi]       | [Generate English]     |
+------------------------+------------------------+
```

### Tab 3: Problem Mapping
Add new problem creation inline + AI suggestions:
```text
+-----------------------------------------------+
| Existing Problems (checkboxes with scores)    |
+-----------------------------------------------+
| + Add New Problem     [Suggest Problems (AI)] |
+-----------------------------------------------+
```

**"Add New Problem" modal:**
- Quick form: Name, Category, Slug (auto-generated)
- Creates problem and auto-selects it

**"Suggest Problems" AI button:**
- Analyzes verse content
- Returns top 3-5 matching problems with suggested relevance scores
- Auto-selects them if admin approves

### Tab 4: Solution & Application
Add AI buttons for each field:
```text
Problem Context:      [textarea] [Generate]
Gita-Based Solution:  [textarea] [Generate]
Life Application:     [textarea] [Generate]
Practical Action:     [textarea] [Generate]

[Generate All Solutions] <- One-click generate all 4
```

### Tab 5: Story
Add AI generation and story type suggestion:
```text
Story Type:    [dropdown] [Auto-Suggest Type]
Story Content: [large textarea]
               Word count: 245
               [Generate Modern Story]
```

**Auto-Suggest Type:** Analyzes content and suggests best story type.

---

## AdminChapterForm.tsx Enhancements

### Current State
Simple form with manual title, theme, and description fields.

### Enhanced Layout

```text
+--------------------------------------------------+
| Chapter Titles                                   |
| English: [input]                                 |
| Hindi: [input] [Generate Hindi Title]            |
| Sanskrit: [input]                                |
+--------------------------------------------------+

+--------------------------------------------------+
| Theme & Descriptions                             |
| Theme: [input] [Suggest Theme from Chapter]      |
|                                                  |
| English Description:    Hindi Description:       |
| [textarea]              [textarea]               |
| [Generate Description]  [Generate Description]   |
|                                                  |
| [Generate Both Descriptions] <- One-click        |
+--------------------------------------------------+
```

---

## AdminShlokList.tsx Enhancements

### Bulk AI Actions
Add bulk AI generation toolbar when items are selected:

```text
+----------------------------------------------------------+
| 3 selected | Publish | Draft | [AI Fill Missing Content] |
+----------------------------------------------------------+
```

**"AI Fill Missing Content"** opens a modal:
- Shows which fields are empty for selected shloks
- Options: Generate Transliteration, Meanings, Story, Solution
- Progress bar showing completion
- Background processing with status updates

---

## Story Type Management

### Database Addition
Add `story_types` configuration table for custom story types:

```sql
CREATE TABLE story_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,        -- 'corporate', 'family', etc.
  display_name TEXT NOT NULL,-- 'Corporate / Business'
  description TEXT,          -- When to use this type
  keywords TEXT[],           -- Keywords that suggest this type
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default types
INSERT INTO story_types (name, display_name, description, keywords) VALUES
('corporate', 'Corporate / Business', 'Stories set in office, business, startup contexts', ARRAY['work', 'office', 'boss', 'team', 'deadline']),
('family', 'Family / Home', 'Stories about family relationships, parenting, home life', ARRAY['parent', 'child', 'home', 'marriage', 'family']),
('youth', 'Youth / Student', 'Stories about students, young adults, career decisions', ARRAY['student', 'college', 'career', 'future', 'exam']),
('global', 'Global / Universal', 'Universal stories applicable to anyone', ARRAY['life', 'journey', 'wisdom', 'choice', 'path']);
```

### Admin Story Types Section
New section in the Story tab:
```text
Story Type: [Corporate ▼] [+ Manage Types]
```

**"Manage Types"** opens modal with:
- List of story types
- Add/Edit/Delete types
- Set keywords for AI auto-detection

---

## Implementation Phases

### Phase 1: Edge Function & Core Component
1. Create `admin-ai-generate` edge function
2. Build `AIGenerateButton` component
3. Update `supabase/config.toml`

### Phase 2: Shlok Form AI Integration
4. Add AI buttons to Core tab (transliteration)
5. Add AI buttons to Meanings tab
6. Add AI buttons to Solution tab
7. Add AI buttons to Story tab with type suggestion

### Phase 3: Problem Mapping Enhancement
8. Add inline problem creation
9. Add AI problem suggestions

### Phase 4: Chapter Enhancements
10. Add AI description generation
11. Add AI theme suggestions

### Phase 5: Story Type Management
12. Database migration for story_types
13. Story type management UI
14. AI type detection integration

### Phase 6: Bulk Operations
15. Add bulk AI generation to shlok list
16. Progress tracking for bulk operations

---

## File Changes Summary

### New Files
- `supabase/functions/admin-ai-generate/index.ts` - AI generation edge function
- `src/components/admin/AIGenerateButton.tsx` - Reusable AI button
- `src/components/admin/AIBulkGenerateModal.tsx` - Bulk generation modal
- `src/components/admin/AddProblemModal.tsx` - Quick problem creation
- `src/components/admin/StoryTypeManager.tsx` - Story type management

### Modified Files
- `supabase/config.toml` - Add new function config
- `src/pages/admin/AdminShlokForm.tsx` - Add AI buttons throughout
- `src/pages/admin/AdminShlokList.tsx` - Add bulk AI actions
- `src/pages/admin/AdminChapterForm.tsx` - Add AI description generation
- `src/lib/adminApi.ts` - Add AI generation API calls

---

## AI Prompt Strategy

Each generation type uses a specialized system prompt:

**Transliteration:**
> Convert Sanskrit Devanagari to IAST transliteration. Be accurate with diacritical marks.

**Hindi Meaning:**
> You are a Sanskrit scholar. Provide a clear Hindi translation that captures the spiritual essence. Use simple, accessible language.

**Modern Story:**
> Write a 200-300 word modern story illustrating this Gita teaching. Setting: {story_type}. Make it relatable to contemporary readers. Include a clear moral connection to the verse.

**Problem Suggestions:**
> Analyze this verse and suggest 3-5 life problems it addresses. Return as JSON: [{name, category, relevance_score}]. Categories: mental, leadership, ethics, career, relationships.

---

## Expected User Flow

### Creating a New Shlok
1. Enter chapter and verse number
2. Paste Sanskrit text
3. Click "Generate Transliteration" - AI fills transliteration
4. Click "Generate Hindi" and "Generate English" - both meanings filled
5. Move to Problems tab, click "Suggest Problems" - AI suggests relevant problems
6. Move to Solution tab, click "Generate All Solutions" - fills all 4 fields
7. Move to Story tab, select type or click "Auto-Suggest", then "Generate Story"
8. Review, edit if needed, publish

**Time savings:** ~30 min manual entry reduced to ~5 min review

