

# Implementation Plan: Branding, Footer, and Share Fixes

## Summary of Testing Results

### UI Test Results
| Area | Status | Notes |
|------|--------|-------|
| Homepage | Working | New card-based layout looking good |
| Chapters Page | Working | Cards displaying properly |
| Shlok Detail Page | Working | Modern Story section visible with Listen button |
| Share Buttons | Working | Copy Link tested successfully, toast confirmation shown |

### TTS Test Results
The "Listen" button is working correctly from a code perspective, but the **ElevenLabs API key has been flagged** by ElevenLabs for "unusual activity" on the free tier. The error message says the free tier has been disabled for this key. The user will need to upgrade to a paid ElevenLabs plan to continue using TTS.

---

## Changes Required

### 1. Rename Website: "GitaWisdom" → "Bhagavad Gita Gyan"

Replace all branding instances across the codebase.

**Files to modify:**

| File | Changes |
|------|---------|
| `index.html` | Update title, meta tags, og tags, twitter tags |
| `src/components/layout/Header.tsx` | Update logo text from "Gita**Wisdom**" to "Bhagavad Gita**Gyan**" |
| `src/components/layout/Footer.tsx` | Update logo text and copyright |
| `src/components/SEOHead.tsx` | Update default title suffix, schema names |
| `src/pages/Index.tsx` | Update SEO title |
| `src/pages/AuthPage.tsx` | Update welcome message |
| `src/pages/admin/AdminDashboard.tsx` | Update admin subtitle |
| `src/components/chat/MessageActions.tsx` | Update share title |

### 2. Footer Text Update

**Current:**
```
Made with ❤️ for seekers of wisdom
```

**New:**
```
Made with ❤️ by dibull (www.dibull.com)
```

**File:** `src/components/layout/Footer.tsx` (line 100)

### 3. Share Buttons Verification

Share buttons are already working correctly:
- **Twitter/X**: Opens Twitter intent with encoded text and URL
- **LinkedIn**: Opens LinkedIn share page
- **WhatsApp**: Opens WhatsApp with message
- **Copy Link**: Copies to clipboard with toast confirmation

No code changes needed for share functionality.

---

## Detailed Implementation

### Phase 1: Update `index.html`

Replace all instances of "GitaWisdom" with "Bhagavad Gita Gyan":
- Line 8: Title tag
- Line 9: Meta title
- Line 11: Author
- Lines 17, 20: Open Graph tags
- Lines 24-25: Twitter tags

### Phase 2: Update Header Component

**File:** `src/components/layout/Header.tsx`

Change lines 43-45:
```tsx
// From:
<span className="text-xl font-semibold tracking-tight">
  Gita<span className="text-primary">Wisdom</span>
</span>

// To:
<span className="text-xl font-semibold tracking-tight">
  Bhagavad Gita<span className="text-primary">Gyan</span>
</span>
```

### Phase 3: Update Footer Component

**File:** `src/components/layout/Footer.tsx`

1. Update logo text (lines 15-17):
```tsx
// From:
Gita<span className="text-primary">Wisdom</span>

// To:
Bhagavad Gita<span className="text-primary">Gyan</span>
```

2. Update copyright (line 97):
```tsx
// From:
© {new Date().getFullYear()} GitaWisdom. All rights reserved.

// To:
© {new Date().getFullYear()} Bhagavad Gita Gyan. All rights reserved.
```

3. Update "Made with" text (lines 99-101):
```tsx
// From:
Made with <Heart /> for seekers of wisdom

// To:
Made with <Heart /> by <a href="https://www.dibull.com" target="_blank">dibull</a>
```

### Phase 4: Update SEOHead Component

**File:** `src/components/SEOHead.tsx`

1. Update title check (line 22):
```tsx
// From:
const fullTitle = title.includes('GitaWisdom') ? title : `${title} | GitaWisdom`;

// To:
const fullTitle = title.includes('Bhagavad Gita Gyan') ? title : `${title} | Bhagavad Gita Gyan`;
```

2. Update schema names (lines 65, 89, 93):
```tsx
name: 'Bhagavad Gita Gyan'
```

### Phase 5: Update Page-Specific Titles

**Files to update:**
- `src/pages/Index.tsx` - SEOHead title
- `src/pages/AuthPage.tsx` - Welcome message
- `src/pages/admin/AdminDashboard.tsx` - Subtitle
- `src/components/chat/MessageActions.tsx` - Share title

---

## Technical Notes

### ElevenLabs TTS Issue
The ElevenLabs API key has been flagged and disabled on the free tier. The user needs to:
1. Upgrade to a paid ElevenLabs plan, OR
2. Get a new API key with a paid subscription

This is an external service issue, not a code issue.

### Share Buttons
All share buttons are functional:
- Use `window.open()` with proper intent URLs
- Encode text and URLs correctly
- Handle clipboard API with error handling
- Show toast notifications for feedback

### Files Summary

| File | Action |
|------|--------|
| `index.html` | Rebrand 6 locations |
| `src/components/layout/Header.tsx` | Rebrand logo |
| `src/components/layout/Footer.tsx` | Rebrand logo, copyright, Made with text + dibull link |
| `src/components/SEOHead.tsx` | Rebrand 4 locations |
| `src/pages/Index.tsx` | Rebrand SEO title |
| `src/pages/AuthPage.tsx` | Rebrand welcome |
| `src/pages/admin/AdminDashboard.tsx` | Rebrand subtitle |
| `src/components/chat/MessageActions.tsx` | Rebrand share title |

