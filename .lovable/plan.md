

# Multi-Feature Enhancement Plan

This plan addresses 7 distinct improvements across AI content generation, UI styling, and navigation.

---

## 1. AI Content Word Limits

Update the edge function prompts to enforce specific word counts for each content type.

| Content Type | Current | New Word Limit |
|--------------|---------|----------------|
| Problem Context | No limit | 50-75 words |
| Solution (Gita) | No limit | 50-75 words |
| Life Application | 2-3 sentences | 25-35 words |
| Practical Action | 2-3 bullet points | 25-30 words |

**File to modify:** `supabase/functions/admin-ai-generate/index.ts`

Changes to prompts:
- `problem_context`: Add "Keep response between 50-75 words"
- `solution_gita`: Add "Keep response between 50-75 words"
- `life_application`: Change to "Write exactly 25-35 words"
- `practical_action`: Change to "Write exactly 25-30 words"

---

## 2. Wisdom Card Content Limit & Design

Make the wisdom card more visually appealing with a 40-word content limit.

**File to modify:** `src/components/shlok/WisdomCardGenerator.tsx`

Changes:
- Truncate quote content to 40 words maximum
- Add decorative elements (subtle patterns, enhanced typography)
- Improve visual hierarchy with better spacing
- Add a helper function to truncate text while preserving complete words

---

## 3. Problems Page Display Fix

The current query syntax for counting related verses may not be returning data correctly.

**File to modify:** `src/pages/ProblemsPage.tsx`

The current approach:
```typescript
.select('*, shlok_problems(count)')
// Then: (p.shlok_problems as any)?.[0]?.count
```

The fix will update the query and mapping to correctly extract verse counts using an explicit subquery or correcting the aggregate syntax.

---

## 4. Verse Navigation on Shlok Detail Page

The `VerseNavigation` component already exists and is included in `ShlokDetailPage.tsx` at line 161. If it's not appearing, the issue may be:
- CSS visibility (the fixed bottom bar might be hidden)
- Missing bottom padding on the page content

**File to modify:** `src/pages/ShlokDetailPage.tsx`

Change: Add bottom padding (`pb-20`) to the container to ensure content isn't hidden behind the fixed navigation bar.

---

## 5. Chapter Detail Page - Bold Saffron Sanskrit Text

Make the Sanskrit verse text in VerseCard bold with a saffron/orange gradient color.

**File to modify:** `src/components/chapters/VerseCard.tsx`

Current styling (line 41):
```tsx
<p className="sanskrit text-base md:text-lg text-center text-foreground/90 ...">
```

New styling:
```tsx
<p className="sanskrit text-base md:text-lg text-center font-bold text-gradient ...">
```

This applies the existing `text-gradient` utility class (orange-to-amber gradient) and adds bold weight.

---

## Summary of Files to Edit

| File | Changes |
|------|---------|
| `supabase/functions/admin-ai-generate/index.ts` | Add word limits to 4 prompt types |
| `src/components/shlok/WisdomCardGenerator.tsx` | 40-word limit + enhanced design |
| `src/pages/ProblemsPage.tsx` | Fix verse count query/mapping |
| `src/pages/ShlokDetailPage.tsx` | Add bottom padding for nav visibility |
| `src/components/chapters/VerseCard.tsx` | Bold + saffron gradient Sanskrit text |

---

## Technical Details

### AI Prompt Updates (Edge Function)

```typescript
// problem_context prompt update
problem_context: `You are analyzing ${verseContext}.
Based on the verse content, identify what life problem or challenge this specific verse addresses.
Be specific about the emotional or situational context.
Write 50-75 words describing the problem scenario.`,

// solution_gita prompt update  
solution_gita: `You are analyzing ${verseContext}.
Based on this specific Gita verse, explain what solution or guidance it offers.
Write 50-75 words focusing on practical wisdom.`,

// life_application prompt update
life_application: `You are analyzing ${verseContext}.
Explain how this verse's teaching applies in modern daily life.
Write exactly 25-35 words with a practical focus.`,

// practical_action prompt update
practical_action: `You are analyzing ${verseContext}.
Provide one specific, actionable step for today based on this verse.
Write exactly 25-30 words.`
```

### Wisdom Card Word Truncation

```typescript
// Helper function to add
function truncateToWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

// Use in card: truncateToWords(shlok.life_application || shlok.english_meaning, 40)
```

### VerseCard Sanskrit Styling

```tsx
// Change from:
<p className="sanskrit text-base md:text-lg text-center text-foreground/90 ...">

// To:
<p className="sanskrit text-base md:text-lg text-center font-bold bg-gradient-to-r from-primary via-amber-500 to-orange-500 bg-clip-text text-transparent ...">
```

