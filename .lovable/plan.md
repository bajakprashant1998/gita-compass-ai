

# Implementation Plan: 5 Major Features

These are large features. I recommend implementing them in phases across multiple messages. Here's the complete plan:

---

## Feature 1: Enhanced JSON-LD, OG Images & Hreflang

**What already exists:** Comprehensive JSON-LD schemas in `seoSchemas.ts` (KnowledgeGraph, WebSite, Organization, Book, Course, SiteNavigation) and `SEOHead.tsx` (Article, Breadcrumb, FAQ, BlogPosting, Chapter, HowTo). Hreflang is supported in SEOHead but not used on most pages. Hindi pages exist at `/hi/` routes.

**What to add:**
- Add hreflang tags to ShlokDetailPage linking `/chapters/X/verse/Y` ↔ `/hi/chapters/X/verse/Y`
- Add hreflang to ChaptersPage, ChapterDetailPage linking to Hindi counterparts
- Create an edge function `generate-og-image` that uses Canvas API (Deno's built-in canvas or SVG-to-PNG) to render verse OG images with Sanskrit text, chapter/verse number, and branding
- Update ShlokDetailPage SEOHead to use dynamic `ogImage` URL pointing to the edge function
- Add BreadcrumbList schema to pages that don't have it yet (BlogPage, ProblemsPage, ChatPage)

**Files to modify:** `ShlokDetailPage.tsx`, `ChaptersPage.tsx`, `ChapterDetailPage.tsx`, `HindiVersePage.tsx`, `HindiChapterPage.tsx`, `BlogPage.tsx`, `ProblemsPage.tsx`
**Files to create:** `supabase/functions/generate-og-image/index.ts`

---

## Feature 2: Daily Streak Notifications + Weekly Digest

**What already exists:** Push notification infrastructure (`send-daily-wisdom` edge function, `push_subscriptions` table, VAPID keys, `sw-push.js`). Reading activity tracking (`reading_activity` table, `useReadingActivity.ts`). User progress with `current_streak`.

**What to add:**
- Enhance `send-daily-wisdom` to include personalized streak data ("You're on a 5-day streak! Don't break it!")
- Create `send-weekly-digest` edge function that:
  - Queries each user's `reading_activity` for the past 7 days
  - Summarizes verses read, streak progress
  - Uses AI (Lovable AI) to recommend 3 next verses based on reading history
  - Sends as a push notification (since email requires auth-only usage)
- Add pg_cron job for weekly digest (Sundays at 10 AM IST)
- Add a "Weekly Digest" toggle in user preferences

**Database changes:** Add `weekly_digest_enabled` boolean to `user_preferences` table
**Files to create:** `supabase/functions/send-weekly-digest/index.ts`
**Files to modify:** `send-daily-wisdom/index.ts`, `PreferencesCard.tsx`, `useUserPreferences.ts`

---

## Feature 3: AI Verse Recommendation Engine

**What to build:**
- Create `verse-recommendations` edge function that:
  - Takes user_id, fetches their `shloks_read` from `user_progress`, `favorites`, and recent `chat_messages`
  - Uses Lovable AI (gemini-3-flash-preview) to analyze patterns and recommend 3-5 verses
  - Returns verse IDs with reasoning
- Create `useVerseRecommendations` hook
- Add "Recommended for You" widget on DashboardPage
- Add "Next Verse for You" card at bottom of ShlokDetailPage (after community section)

**Files to create:** `supabase/functions/verse-recommendations/index.ts`, `src/hooks/useVerseRecommendations.ts`, `src/components/dashboard/RecommendedVerses.tsx`, `src/components/shlok/NextVerseRecommendation.tsx`
**Files to modify:** `DashboardPage.tsx`, `ShlokDetailPage.tsx`, `supabase/config.toml`

---

## Feature 4: Admin Content Calendar

**What already exists:** `AdminScheduleCalendar.tsx` showing scheduled verse publications in a month view. Blog posts with `created_at`/`updated_at`. Auto-blog system.

**What to add:**
- Enhance the existing calendar to show 3 content types: scheduled shloks, blog posts (published + drafts), and daily wisdom
- Add color-coded badges per content type
- Add drag-and-drop rescheduling (update `scheduled_publish_at` on drop) using native HTML drag events
- Add bulk actions toolbar: select multiple items → publish/unpublish/reschedule
- Add blog post scheduling (new `scheduled_publish_at` column on `blog_posts`)

**Database changes:** Add `scheduled_publish_at` timestamp column to `blog_posts` table
**Files to modify:** `AdminScheduleCalendar.tsx`

---

## Feature 5: Shareable Social Cards

**What already exists:** `WisdomCardGenerator.tsx` — a full-featured card generator with 8 themes, 3 aspect ratios, AI background generation, and PNG download via `html-to-image`. This feature is **already built**.

**What to add (enhancement):**
- Add a quick "Share as Image" button directly in the share menu (ShlokActions/ShareWisdomCard) that auto-generates a card with default theme and downloads immediately — one-click flow vs. the full editor
- Add WhatsApp and Instagram story-sized (9:16) aspect ratio option
- Pre-fill the card with Sanskrit text + English meaning (currently uses life_application)

**Files to modify:** `ShareWisdomCard.tsx`, `WisdomCardGenerator.tsx`

---

## Implementation Order (Recommended)

1. **Feature 5** — Quick social cards (smallest scope, enhances existing component)
2. **Feature 1** — SEO structured data & hreflang (high SEO impact, no backend changes)
3. **Feature 4** — Content calendar enhancement (admin-only, contained scope)
4. **Feature 3** — AI recommendations (new edge function + UI widgets)
5. **Feature 2** — Streak notifications + digest (new edge function + cron + preferences)

**Estimated scope:** This is approximately 5 implementation messages worth of work. I recommend starting with Features 5 + 1 together (both are frontend-heavy), then proceeding through 4, 3, 2.

Shall I begin implementation?

