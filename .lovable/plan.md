

# Enhanced User Dashboard Plan

## Overview
Redesign the user dashboard with the WebFX aesthetic, fix the sign out bug, add real data from existing tables (user_progress, chat_conversations, user_preferences), and make it fully responsive.

---

## 1. Fix Sign Out Bug (Critical)

**Problem**: The `navigate('/auth')` call inside the render body (line 34-37 of DashboardPage) causes a React warning and may prevent proper rendering. The sign out handler itself looks correct, but the redirect-if-not-logged-in logic needs to use `useEffect` instead of calling navigate during render.

**Fix**:
- Wrap the `if (!user) navigate('/auth')` check in a `useEffect` so it runs after render
- Ensure sign out clears state and redirects properly

---

## 2. Enhanced Dashboard Design (WebFX Aesthetic)

### Hero/Welcome Section
- Add gradient background with `RadialGlow` and `FloatingOm` decorative elements (matching other pages)
- Larger greeting with a gradient text effect on the user's name
- Add user avatar placeholder with initials
- Show member-since date from profile
- Move sign out to a dropdown or secondary action

### Stats Cards (Live Data)
Pull real data from existing `user_progress`, `favorites`, and `chat_conversations` tables:
- **Saved Verses**: From favorites count (already working)
- **Chapters Explored**: From `user_progress.chapters_explored` array length
- **Verses Read**: From `user_progress.shloks_read` array length
- **Day Streak**: From `user_progress.current_streak`
- **AI Conversations**: Count from `chat_conversations` table
- **Language**: From profile (already working)

Style: Gradient icon backgrounds, animated counters, hover-lift effect

### Reading Progress Section (New)
- Visual progress bar showing chapters explored out of 18
- Circular or linear progress indicator
- "Continue Reading" button linking to the last explored chapter

### Saved Wisdom Section (Enhanced)
- Better card design with gradient left border (GradientBorderCard)
- Show Sanskrit snippet preview
- Improved empty state with illustration

### Quick Actions Section (Enhanced)
- Larger, more visual action cards with gradient backgrounds
- Add "Daily Wisdom" action card
- Add "Reading History" summary

### Preferences Quick Settings (New)
- Toggle for language preference (English/Hindi) inline
- Toggle for daily wisdom notifications
- Theme toggle (light/dark)

---

## 3. New Hooks and Data Fetching

### `useUserProgress` hook
- Fetch from `user_progress` table by user_id
- Return chapters explored, shloks read, streak data

### `useChatHistory` hook (lightweight)
- Count conversations from `chat_conversations` table
- Return total count for stats display

### `useUserPreferences` hook
- Fetch and update `user_preferences` table
- Support theme, notifications, daily wisdom toggles

---

## 4. Mobile Responsiveness

- **Stats grid**: `grid-cols-2` on mobile, `grid-cols-3 md:grid-cols-6` on desktop (compact stat pills)
- **Two-column layout**: Stack to single column on mobile (`grid-cols-1 lg:grid-cols-2`)
- **Welcome section**: Full-width on mobile, compact avatar + name layout
- **Quick action cards**: Smaller padding on mobile (`p-3 sm:p-4`)
- **Sign out button**: Full-width on mobile, icon-only option
- **Touch targets**: Minimum 44px for all interactive elements
- **Safe area**: `pb-safe` on bottom content for iOS

---

## 5. Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/DashboardPage.tsx` | Complete redesign with new layout and features |
| `src/hooks/useUserProgress.ts` | New hook for user_progress data |
| `src/hooks/useUserPreferences.ts` | New hook for user_preferences data |
| `src/hooks/useChatHistory.ts` | New hook for chat conversation count |

---

## 6. Testing Plan
- Test sign up flow (create new account, verify redirect to dashboard)
- Test sign in flow (existing account, verify dashboard loads with data)
- Test sign out (verify redirect to home, verify session cleared)
- Test dashboard on mobile (375px) and desktop (1920px)
- Verify stats display real data from database tables

