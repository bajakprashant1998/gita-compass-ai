

# GitaWisdom - Feature Expansion Plan

## Overview

This plan covers four major enhancements to the GitaWisdom platform:
1. AI Search Box on Homepage
2. Add all 47 shloks for Chapter 1
3. SEO-friendly structure
4. Downloadable Wisdom Card Image Generator

---

## Feature 1: AI Search Box on Homepage

### What It Does
A prominent search box on the homepage where users can type their life problems in natural language (e.g., "I fear making leadership decisions"). The AI will:
- Understand the emotional context
- Match relevant problem tags
- Return matching shloks with personalized guidance
- Allow one-click navigation to full shlok details

### Implementation

**New Component**: `src/components/home/AISearchBox.tsx`
- Full-width search input with AI sparkle icon
- Animated placeholder showing example problems
- Debounced search to prevent excessive API calls
- Results displayed as cards below the search box

**New Edge Function**: `supabase/functions/search-shloks/index.ts`
- Uses Lovable AI (Gemini) to:
  1. Analyze the user's input for emotional keywords
  2. Map to problem categories (anxiety, fear, confusion, etc.)
  3. Perform database search on `shlok_problems` table
  4. Return top 3-5 matching shloks with relevance explanation

**Homepage Integration**:
- Add `<AISearchBox />` below the hero tagline
- Show quick results inline with "View Full Guidance" links
- Include "Ask AI Coach" button for deeper conversation

**User Flow**:
```text
User types: "I'm scared of failing at my new job"
     ↓
AI detects: fear, self-doubt, anxiety, leadership
     ↓
Database query: Find shloks tagged with these problems
     ↓
Results: 3 relevant shloks with chapter/verse references
     ↓
User clicks: Goes to full shlok detail page
```

---

## Feature 2: Add All 47 Shloks for Chapter 1

### Content Structure (Per Shlok)
Each shlok will have the complete data structure matching Shlok 1:

| Field | Description |
|-------|-------------|
| `sanskrit_text` | Original Devanagari text |
| `transliteration` | Roman script pronunciation |
| `hindi_meaning` | Simple Hindi translation |
| `english_meaning` | Clear, modern English meaning |
| `life_application` | One-line practical takeaway |
| `practical_action` | Actionable step for today |
| `problem_context` | Modern problem this addresses |
| `solution_gita` | How Gita wisdom solves it |
| `modern_story` | 200-300 word contemporary example |

### Database Migration
- Insert 46 new shloks (verse 2-47) for Chapter 1
- Map each shlok to 2-4 relevant problem categories
- Include relevance scores for sorting

### Content Themes for Chapter 1 (Arjuna Vishada Yoga)
Chapter 1 is about "The Yoga of Arjuna's Dejection" - perfect for:
- **Confusion**: Verses about Arjuna's moral dilemma
- **Relationships**: Family conflicts and duty
- **Fear**: Fear of consequences and loss
- **Decision Making**: Paralysis before important choices
- **Self-Doubt**: Questioning one's capabilities

### Sample Shlok Mappings

| Verse | Primary Theme | Problems Addressed |
|-------|---------------|-------------------|
| 1.2-11 | Army description | Leadership, Anxiety |
| 1.12-19 | Conch blowing | Courage, Fear |
| 1.20-27 | Arjuna's observation | Relationships, Confusion |
| 1.28-35 | Arjuna's dilemma | Decision Making, Self-Doubt |
| 1.36-46 | Arjuna's grief | Anxiety, Fear, Confusion |
| 1.47 | Arjuna's despair | Self-Doubt, Relationships |

---

## Feature 3: SEO-Friendly Structure

### Implementation Components

**1. React Helmet Async Integration**
- Install `react-helmet-async` package
- Create `<HelmetProvider>` wrapper in `App.tsx`
- Create reusable `<SEOHead>` component

**2. New Component**: `src/components/SEOHead.tsx`
```text
Props:
- title: Page title
- description: Meta description
- canonicalUrl: Canonical URL
- ogImage: Open Graph image URL
- keywords: SEO keywords array
- structuredData: JSON-LD schema object
```

**3. Update index.html**
- Set proper site title: "GitaWisdom - Ancient Wisdom for Modern Problems"
- Add comprehensive meta tags
- Add favicon and branding

**4. Page-Specific SEO**

| Page | Title Pattern | Description |
|------|--------------|-------------|
| Homepage | "GitaWisdom - Ancient Wisdom for Modern Life" | AI-powered guidance from Bhagavad Gita |
| Chapter List | "All 18 Chapters - Bhagavad Gita - GitaWisdom" | Explore all chapters with modern insights |
| Chapter Detail | "Chapter {N}: {Title} - Bhagavad Gita" | {theme} - {verse_count} verses |
| Shlok Detail | "Chapter {N}, Verse {M} - {life_application}" | {english_meaning} |
| Problems | "Life Problems & Solutions - GitaWisdom" | Find wisdom for anxiety, fear, confusion |
| Problem Detail | "{Problem} - Bhagavad Gita Guidance" | {description} |

**5. JSON-LD Structured Data**
- `WebSite` schema on homepage
- `Article` schema for shlok pages
- `BreadcrumbList` schema for navigation
- `Organization` schema for brand

**6. SEO-Friendly URLs**
Current URL structure is already good:
- `/chapters/:chapterNumber` - Clean chapter URLs
- `/shlok/:shlokId` - UUID-based (will add semantic alternative)
- `/problems/:slug` - Slug-based problem pages

**New Route Addition**:
- `/chapter/:chapterNumber/verse/:verseNumber` - Human-readable shlok URLs

**7. Sitemap Generation**
- Create static `sitemap.xml` in `/public`
- List all chapters, problems, and key shloks
- Update `robots.txt` to reference sitemap

---

## Feature 4: Downloadable Wisdom Card Image Generator

### What It Does
Users can create beautiful, shareable image cards featuring shlok wisdom, perfect for Instagram, LinkedIn, and other social media.

### New Component: `src/components/shlok/WisdomCardGenerator.tsx`

**Card Design Options**:
1. **Minimal**: Quote + reference on clean background
2. **Gradient**: Quote on beautiful gradient background
3. **Sanskrit**: Sanskrit text with English meaning below
4. **Story**: Key insight from the modern story

**Technical Implementation**:
- Use `html-to-image` library (lighter than html2canvas)
- Hidden render container for card generation
- Download as PNG (1080x1080 for Instagram square)
- Copy to clipboard option

**Card Layout**:
```text
┌─────────────────────────────────┐
│                                 │
│   [GitaWisdom logo]             │
│                                 │
│   "Life application quote       │
│    from the shlok..."           │
│                                 │
│   — Chapter X, Verse Y          │
│                                 │
│   gitawisdom.com                │
│                                 │
└─────────────────────────────────┘
```

**Color Themes**:
- Warm Earth (default): #F5F0E8 bg, #8B4513 accent
- Deep Ocean: #1a365d bg, #63b3ed accent
- Forest Calm: #1a4731 bg, #68d391 accent
- Sunset Glow: #744210 bg, #f6ad55 accent

### Integration Points
- Replace current `ShareWisdomCard` component
- Add "Download Card" button
- Preview card before download
- Aspect ratio selector (1:1, 4:5, 16:9)

---

## Technical Summary

### New Files to Create
1. `src/components/home/AISearchBox.tsx` - Homepage AI search
2. `src/components/SEOHead.tsx` - Reusable SEO component
3. `src/components/shlok/WisdomCardGenerator.tsx` - Image generator
4. `supabase/functions/search-shloks/index.ts` - AI search edge function
5. `public/sitemap.xml` - SEO sitemap
6. Database migration for 46 new Chapter 1 shloks

### Files to Modify
1. `index.html` - Update meta tags and title
2. `src/App.tsx` - Add HelmetProvider and new route
3. `src/pages/Index.tsx` - Add AISearchBox component
4. `src/pages/ShlokDetailPage.tsx` - Add SEOHead and new card generator
5. `src/pages/ChapterDetailPage.tsx` - Add SEOHead
6. `src/pages/ChaptersPage.tsx` - Add SEOHead
7. `src/pages/ProblemsPage.tsx` - Add SEOHead
8. `src/pages/ProblemDetailPage.tsx` - Add SEOHead
9. `src/lib/api.ts` - Add search function
10. `public/robots.txt` - Add sitemap reference

### New Dependencies
- `react-helmet-async` - Dynamic meta tag management
- `html-to-image` - Card image generation

### Database Changes
- Insert 46 shloks for Chapter 1 (verses 2-47)
- Insert shlok_problems mappings for each verse

---

## Implementation Order

1. **SEO Setup** (Foundation)
   - Install react-helmet-async
   - Create SEOHead component
   - Update index.html with proper meta tags
   - Add to all pages

2. **Chapter 1 Content** (Data)
   - Run database migration with all 47 shloks
   - Map problem categories

3. **AI Search Box** (Feature)
   - Create search edge function
   - Build AISearchBox component
   - Integrate on homepage

4. **Wisdom Card Generator** (Enhancement)
   - Install html-to-image
   - Create WisdomCardGenerator component
   - Replace ShareWisdomCard

