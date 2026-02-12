

# New Features Implementation Plan

## Overview

Four new features to enhance the Bhagavad Gita Gyan platform, adding daily engagement, audio experiences, structured learning paths, and social wisdom sharing.

---

## Feature 1: Verse of the Day Widget

A beautiful, time-locked daily verse card on the homepage that stays consistent for all users throughout the day.

**How it works:**
- Uses a deterministic algorithm based on the current date to pick the same verse for everyone each day
- Displays Sanskrit text, English meaning, and a "Read Full Verse" link
- Includes share-to-social buttons (WhatsApp, Twitter, copy link) and a save/favorite button
- Replaces the current random "Daily Wisdom" component with a proper date-based one

**Changes:**
- `src/components/home/DailyWisdom.tsx` -- Rewrite to use date-based verse selection instead of random, add share buttons and favorite toggle
- `src/lib/api.ts` -- Add a `getDailyVerse(date: string)` function that fetches a verse deterministically by date

---

## Feature 2: Verse Audio Playback

Listen to Sanskrit verses with proper pronunciation using the existing Google TTS edge function.

**How it works:**
- Adds a play button on each verse detail page next to the Sanskrit text
- When clicked, sends the Sanskrit text to the `google-tts` edge function
- Shows a mini audio player with play/pause and loading state
- Caches the audio blob in memory so replaying doesn't re-fetch

**Changes:**
- `src/components/shlok/SanskritVerse.tsx` -- Add a play/pause button with audio state management
- Create `src/hooks/useVerseAudio.ts` -- Custom hook to fetch and cache TTS audio from the existing `google-tts` edge function

---

## Feature 3: Guided Reading Plans

Curated multi-day spiritual journeys with progress tracking (e.g., "7 Days to Inner Peace", "Overcoming Fear in 5 Days").

**How it works:**
- A new `/reading-plans` page shows available plans as beautiful cards
- Each plan has a title, description, duration, difficulty, and a list of daily verse assignments
- Logged-in users can "Start Plan" and track daily progress
- A plan detail page shows each day's verse with completion checkmarks

**Database tables needed:**
- `reading_plans` -- id, title, description, duration_days, difficulty, icon, display_order, created_at
- `reading_plan_days` -- id, plan_id, day_number, shlok_id, reflection_prompt, created_at
- `user_reading_plans` -- id, user_id, plan_id, current_day, started_at, completed_at, status (active/completed/paused)

RLS policies:
- `reading_plans` and `reading_plan_days`: public SELECT, admin ALL
- `user_reading_plans`: users can manage their own records

**New files:**
- `src/pages/ReadingPlansPage.tsx` -- List of available plans
- `src/pages/ReadingPlanDetailPage.tsx` -- Individual plan with daily progress
- `src/components/reading-plans/PlanCard.tsx` -- Card component for plan listing
- `src/components/reading-plans/DayProgress.tsx` -- Daily checklist with verse links

**Route additions in `src/App.tsx`:**
- `/reading-plans` -- Plans listing
- `/reading-plans/:planId` -- Plan detail with daily progress

**Seed data:** Pre-populate 3-4 starter plans via migration (e.g., "7 Days to Inner Peace", "Overcoming Fear", "Finding Your Purpose", "Karma Yoga in Daily Life")

---

## Feature 4: Community Reflections

Let users write and share short personal reflections on verses, visible to other users for inspiration.

**How it works:**
- On each verse detail page, a "Community Reflections" section below the content
- Logged-in users can write a reflection (max 500 chars) tied to a specific shlok
- Other users can see reflections and "like" (heart) them
- Most-liked reflections surface to the top

**Database tables needed:**
- `verse_reflections` -- id, user_id, shlok_id, content (text, max 500), created_at
- `reflection_likes` -- id, user_id, reflection_id, created_at (unique on user_id + reflection_id)

RLS policies:
- `verse_reflections`: public SELECT, authenticated INSERT (own user_id), authenticated UPDATE/DELETE (own records only)
- `reflection_likes`: public SELECT, authenticated INSERT/DELETE (own records)

**New files:**
- `src/components/shlok/CommunityReflections.tsx` -- Main section with reflection list and input form
- `src/components/shlok/ReflectionCard.tsx` -- Individual reflection with like button and author info
- `src/hooks/useReflections.ts` -- Query hook for fetching/creating reflections and likes

**Integration:** Add `CommunityReflections` component to `ShlokDetailPage.tsx` below the existing content sections.

---

## Technical Details

### Database Migration (single migration for all new tables)

Creates 5 new tables:
1. `reading_plans` with public read access
2. `reading_plan_days` with public read access
3. `user_reading_plans` with user-scoped RLS
4. `verse_reflections` with public read, user-scoped write
5. `reflection_likes` with public read, user-scoped write

Includes seed data for 3-4 reading plans with pre-assigned verses from the existing `shloks` table.

### New Routes
- `/reading-plans` -- Lazy-loaded plans listing page
- `/reading-plans/:planId` -- Lazy-loaded plan detail page

### Files Modified
- `src/App.tsx` -- Add 2 new routes
- `src/components/home/DailyWisdom.tsx` -- Rewrite for date-based verse
- `src/components/shlok/SanskritVerse.tsx` -- Add audio play button
- `src/pages/ShlokDetailPage.tsx` -- Add CommunityReflections section
- `src/lib/api.ts` -- Add getDailyVerse function

### New Files (8 total)
- `src/hooks/useVerseAudio.ts`
- `src/hooks/useReflections.ts`
- `src/pages/ReadingPlansPage.tsx`
- `src/pages/ReadingPlanDetailPage.tsx`
- `src/components/reading-plans/PlanCard.tsx`
- `src/components/reading-plans/DayProgress.tsx`
- `src/components/shlok/CommunityReflections.tsx`
- `src/components/shlok/ReflectionCard.tsx`

