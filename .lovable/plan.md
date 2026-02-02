

# Redesign Verse Cards - WebFX Style with Sanskrit Display

## Summary

This plan redesigns the verse cards on `/chapters/{chapterNumber}` to follow WebFX design principles with bold typography, gradient accents, and prominent Sanskrit text display for each verse.

| Element | Current State | New Design |
|---------|---------------|------------|
| Sanskrit Text | Not shown | Prominently displayed at top |
| Card Layout | Simple horizontal | Two-section vertical layout |
| Visual Hierarchy | Minimal | Bold verse number, gradient accents |
| Hover Effects | Basic | Glow effect, lift animation |
| Typography | Standard | WebFX-inspired bold headlines |

---

## Design Approach (WebFX Inspired)

### Key WebFX Design Elements to Apply:
1. **Bold Typography** - Large verse numbers with gradient text
2. **Clear Visual Hierarchy** - Sanskrit first, then meaning
3. **Gradient Accents** - Orange-to-amber gradient borders and highlights
4. **Card Depth** - Subtle shadows with glow effects on hover
5. **Micro-interactions** - Smooth lift and arrow animations

---

## New Verse Card Design

```text
+---------------------------------------------------------------+
|  [Gradient Left Border]                                        |
|                                                                |
|  VERSE 27                              [Arrow Icon →]          |
|  ─────────────────────────────────────────────────────────     |
|                                                                |
|  ॥ Sanskrit Shlok Text ॥                                      |
|  जातस्य हि ध्रुवो मृत्युर्ध्रुवं जन्म मृतस्य च।              |
|  तस्मादपरिहार्येऽर्थे न त्वं शोचितुमर्हसि॥                    |
|                                                                |
|  ─────────────────────────────────────────────────────────     |
|                                                                |
|  "For one who is born, death is certain..."                    |
|                                                                |
|  [💡 Life Application preview] or [📖 Story preview]           |
|                                                                |
+---------------------------------------------------------------+
```

### Visual Features:
- **Left gradient border** (4px) - Primary to amber gradient
- **Large verse number** with gradient text styling
- **Sanskrit text block** - Centered, larger font, special styling
- **Decorative divider** - Gradient line separator
- **English meaning** - Truncated preview (2 lines)
- **Context badges** - Life application or story indicator
- **Hover glow** - Primary color shadow effect
- **Arrow animation** - Slides right on hover

---

## Component Structure

### Option A: Inline in ChapterDetailPage
Modify the verse card JSX directly in `ChapterDetailPage.tsx`

### Option B: Create Dedicated Component (Recommended)
Create `src/components/chapters/VerseCard.tsx` for reusability

**Recommendation**: Option B for cleaner code and potential reuse

---

## Files to Modify/Create

| File | Action | Purpose |
|------|--------|---------|
| `src/components/chapters/VerseCard.tsx` | Create | New verse card component |
| `src/pages/ChapterDetailPage.tsx` | Modify | Import and use VerseCard |
| `src/index.css` | Modify | Add verse card specific styles |

---

## Implementation Details

### New Component: `src/components/chapters/VerseCard.tsx`

```tsx
interface VerseCardProps {
  shlok: Shlok;
  chapterNumber: number;
  animationDelay?: number;
}
```

**Features:**
- Accepts shlok data and chapter number
- Displays Sanskrit text prominently
- Shows truncated English meaning
- Life application or story indicator
- Hover effects with glow
- Accessible link wrapper

### Key Styling Classes:
```css
/* Verse card with left gradient border */
.verse-card {
  position: relative;
  border-left: 4px solid transparent;
  border-image: linear-gradient(to bottom, hsl(var(--primary)), hsl(35 93% 47%)) 1;
}

/* Sanskrit text with Om symbol decorations */
.sanskrit-preview {
  font-family: 'Noto Sans Devanagari', sans-serif;
  line-height: 1.6;
  text-align: center;
}
```

### ChapterDetailPage Changes:
- Import new VerseCard component
- Replace inline card JSX with component
- Pass shlok data and chapter number

---

## Visual Hierarchy

1. **Verse Number** (XL, Gradient, Bold)
2. **Sanskrit Shlok** (Large, Centered, Decorative)
3. **Divider Line** (Gradient)
4. **English Meaning** (Medium, Muted, 2-line clamp)
5. **Context Indicator** (Small, Colored badge)
6. **Read Action** (Appears on hover)

---

## Responsive Considerations

| Screen | Adjustments |
|--------|-------------|
| Desktop | Full layout, larger Sanskrit text |
| Tablet | Slightly reduced padding |
| Mobile | Stack elements, smaller Sanskrit text, touch-friendly |

---

## Technical Notes

### Sanskrit Text Handling:
- Each shlok has `sanskrit_text` field in database
- Text may contain newlines - use `whitespace-pre-line`
- Apply `.sanskrit` class for proper font rendering

### Truncation:
- Sanskrit: Show first 2 lines with `line-clamp-2`
- English meaning: 2 lines with `line-clamp-2`
- Life application/story: 1 line preview

### Performance:
- Use CSS animations (no JS)
- Staggered animation delays for list rendering
- Lazy loading for long lists (future enhancement)

