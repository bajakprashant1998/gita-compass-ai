

# Comprehensive SEO Expansion Plan

This plan covers 5 major features to dominate search rankings and AI discovery.

---

## 1. Enhanced Programmatic Landing Pages

**What exists**: `/bhagavad-gita-on-:topic` route already works with `GitaWisdomPage.tsx`, pulling from 9 problems in the database.

**What to add**:
- Add alternate URL patterns: `/bhagavad-gita-for-:audience` (students, working professionals, parents) and `/krishna-quotes-on-:topic` (love, life, death, duty)
- Create a new `seo_landing_pages` table to define audience-based and quote-based pages beyond the problems table
- Add a sitemap entry generator that auto-lists all programmatic pages
- Add internal links from the homepage and blog to these pages

**Database**: New `seo_landing_pages` table with columns: `id`, `slug`, `page_type` (topic/audience/quotes), `title`, `description`, `keywords[]`, `related_problem_ids[]`, `created_at`

**Routes**: 
- `/bhagavad-gita-for-:audience` 
- `/krishna-quotes-on-:topic`
- Both reuse a generalized version of `GitaWisdomPage`

---

## 2. Verse-level Canonical Short URLs

**What exists**: `/chapters/:c/verse/:v` is the current canonical. `/shlok/:id` redirects already.

**What to add**:
- New route `/verse/:ref` where ref = `2-47`, `18-66` etc.
- This redirects (301) to the full canonical `/chapters/2/verse/47`
- Update `robots.txt` and sitemap to include `/verse/X-Y` as alternate
- Add `<link rel="alternate" href="/verse/2-47">` on each verse page for short-URL discovery

**Implementation**: Simple route in App.tsx + a new redirect component that parses `2-47` format.

---

## 3. Multi-language SEO Pages

**What exists**: `shlok_translations` table with multi-language content. `hreflang` support in SEOHead.

**What to add**:
- New route `/hi/chapters/:c/verse/:v` for Hindi verse pages
- A lightweight `HindiVersePage` component that renders Hindi meaning, transliteration with proper `lang="hi"` tags
- Proper `hreflang` tags linking EN and HI versions bidirectionally
- Hindi homepage at `/hi` with basic chapter listing
- Add `<html lang="hi">` for Hindi pages

**No new tables needed** -- uses existing `shlok_translations` data.

---

## 4. Weekly Auto-Blog System

**What exists**: AI blog generation via `admin-ai-generate` edge function. Blog posts table with full SEO fields.

**What to add**:
- New edge function `auto-blog-publish` that:
  1. Picks a trending topic from a predefined rotation or AI suggestion
  2. Calls `admin-ai-generate` with `type: "blog_post"`
  3. Inserts the generated post as published
- A `pg_cron` job scheduled weekly (every Sunday 6 AM IST)
- Admin UI toggle in Settings to enable/disable auto-blog
- Activity log entry for each auto-published post

**Database**: Add `auto_blog_enabled` to `admin_settings`. Create cron job via SQL insert.

---

## 5. Google Web Stories

**What to add**:
- New route `/stories/:storySlug` rendering AMP-compatible Web Stories
- A `web_stories` table: `id`, `title`, `slug`, `slides[]` (JSONB array with image, text, verse_ref), `shlok_id`, `published`, `created_at`
- Each story = 5-8 slides with verse quote, meaning, life application
- Admin page to create/manage stories
- Stories sitemap at `/stories-sitemap.xml`
- Link stories from verse detail pages

**Story format**: Each slide is a full-screen card with gradient background, Sanskrit text, and English meaning -- pure HTML/CSS (no AMP library needed for initial version, styled as swipeable carousel).

---

## Implementation Priority

| # | Feature | Impact | Effort |
|---|---------|--------|--------|
| 1 | Programmatic pages expansion | High (long-tail traffic) | Medium |
| 2 | Verse short URLs | Medium (link authority) | Low |
| 3 | Weekly auto-blog | High (fresh content signal) | Medium |
| 4 | Multi-language pages | High (Hindi search market) | Medium |
| 5 | Google Web Stories | Medium (visual SERP presence) | High |

---

## Technical Details

**New files to create**:
- `src/pages/VerseShortRedirect.tsx` -- parses `/verse/2-47` and redirects
- `src/pages/AudienceWisdomPage.tsx` -- for `/bhagavad-gita-for-:audience`
- `src/pages/KrishnaQuotesPage.tsx` -- for `/krishna-quotes-on-:topic`
- `src/pages/HindiVersePage.tsx` -- Hindi verse rendering
- `src/pages/WebStoryPage.tsx` -- swipeable story viewer
- `src/pages/admin/AdminWebStories.tsx` -- story management
- `supabase/functions/auto-blog-publish/index.ts` -- weekly blog generator

**Files to modify**:
- `src/App.tsx` -- add new routes
- `public/robots.txt` -- add story sitemap
- `index.html` -- add hreflang for Hindi homepage
- `supabase/config.toml` -- add auto-blog-publish function

**Database migrations**:
- `seo_landing_pages` table
- `web_stories` table
- `pg_cron` job for auto-blog (via insert tool)

