

# Implementation Plan: Features 4, 3, and 2

## Feature 4: Enhanced Admin Content Calendar

### Database Migration
- Add `scheduled_publish_at` timestamp column to `blog_posts` table

### Changes to `AdminScheduleCalendar.tsx`
- **Fetch blog posts** alongside shloks: query `blog_posts` for items with `scheduled_publish_at` in the current month, plus published posts by `created_at`
- **Unified calendar items** with a `type` field: `'shlok' | 'blog'` — each color-coded (orange for shloks, blue for blogs)
- **Drag-and-drop rescheduling** using native HTML5 drag events (`draggable`, `onDragStart`, `onDragOver`, `onDrop`). On drop, update `scheduled_publish_at` via Supabase for the dragged item's table
- **Bulk actions toolbar**: checkbox selection on calendar items with a floating action bar for bulk publish/unpublish/reschedule (date picker popover)
- **Legend** showing color codes for each content type

---

## Feature 3: AI Verse Recommendation Engine

### New Edge Function: `verse-recommendations/index.ts`
- Accepts `user_id`, fetches their `shloks_read` from `user_progress`, `favorites`, and last 10 `chat_messages`
- Sends context to Lovable AI (gemini-3-flash-preview) with tool calling to extract structured output: array of `{ shlok_id, chapter, verse, reason }`
- Queries available shloks the user hasn't read yet, passes a sample to the AI for selection
- Returns 3-5 recommendations with reasoning

### New Files
- `src/hooks/useVerseRecommendations.ts` — calls the edge function via `supabase.functions.invoke`
- `src/components/dashboard/RecommendedVerses.tsx` — card widget showing recommended verses with reasons and links
- `src/components/shlok/NextVerseRecommendation.tsx` — compact "Next for You" card at bottom of verse page

### Modified Files
- `DashboardPage.tsx` — add `RecommendedVerses` widget after the Daily Affirmation section
- `ShlokDetailPage.tsx` — add `NextVerseRecommendation` before the community section
- `supabase/config.toml` — add `[functions.verse-recommendations]` with `verify_jwt = false`

---

## Feature 2: Streak Notifications + Weekly Digest

### Database Migration
- Add `weekly_digest_enabled` boolean column (default `true`) to `user_preferences`

### Enhance `send-daily-wisdom/index.ts`
- For each subscription, look up the user's `user_progress` to get `current_streak`
- Personalize notification title: "🔥 Day {streak}! Keep your streak alive!" when streak > 0, otherwise standard wisdom

### New Edge Function: `send-weekly-digest/index.ts`
- Query all users with `weekly_digest_enabled = true` in `user_preferences`
- For each user: fetch `reading_activity` for past 7 days, `user_progress` for streak, and `shloks_read` count
- Use Lovable AI (gemini-2.5-flash-lite) to generate 3 verse recommendations based on reading patterns
- Build push notification payload summarizing: "This week: X verses read, Y-day streak. Try these next: ..."
- Send via the existing `sendWebPush` utility (extract to shared code pattern within the function)

### pg_cron Job
- Schedule `send-weekly-digest` to run every Sunday at 10 AM IST (`30 4 * * 0` UTC)

### UI Changes
- `PreferencesCard.tsx` — add "Weekly Digest" toggle
- `useUserPreferences.ts` — add `weeklyDigestEnabled` to the data model and update mutation

---

## Implementation Order
1. Feature 4 (DB migration + calendar rewrite)
2. Feature 3 (edge function + hooks + widgets)
3. Feature 2 (edge function + preferences + cron)

