

# New Features Plan

## Overview
Based on the current state of the project, here are 5 high-impact features to add that enhance engagement, discoverability, and user retention.

---

## Feature 1: "Verse of the Day" Share to WhatsApp/Social

**What it does**: On the Daily Wisdom section and individual verse pages, add a "Share to WhatsApp" button that generates a beautifully formatted text message with the Sanskrit verse, English meaning, and a direct link back to the website.

**Why**: WhatsApp is the primary sharing medium for the target audience (Indian users). This drives organic traffic.

**Changes**:
- Add a `ShareButtons` component with WhatsApp, Twitter, and Copy Link options
- Update `DailyWisdom.tsx` to use the share component (replacing the current non-functional Share2 icon button)
- Update `ShareWisdomCard.tsx` to include WhatsApp sharing

---

## Feature 2: Bookmark Collections (Organize Saved Verses)

**What it does**: Let users organize their saved/favorite verses into named collections like "Morning Mantras", "For Tough Days", "Karma Yoga", etc. Currently all favorites are in one flat list.

**Why**: Users with many saved verses need organization. This increases return visits and engagement.

**Changes**:
- Create a new `bookmark_collections` table with columns: id, user_id, name, description, created_at
- Create a `collection_items` table: id, collection_id, shlok_id, added_at
- Add a `CollectionManager` component for creating/viewing collections
- Update `SavedWisdomCard` on dashboard to show collection previews
- Add collection picker when saving a verse

---

## Feature 3: "Ask About This Verse" - Contextual AI Chat

**What it does**: On every verse detail page, add a small inline chat box where users can ask questions specifically about that verse. For example: "How do I apply this at work?" or "Explain this in simple terms." The AI response is pre-contextualized with the verse.

**Why**: Bridges the gap between reading a verse and understanding it deeply. Currently users must go to the separate chat page and re-explain which verse they mean.

**Changes**:
- Create `VerseChat` component - a compact expandable chat box
- Add it to `ShlokDetailPage.tsx` after the actions section
- The chat pre-loads the verse context into the system prompt automatically
- Uses the existing `gita-coach` edge function with an added `verse_context` parameter

---

## Feature 4: Reading Streaks with Visual Calendar

**What it does**: Show a GitHub-style contribution/activity heatmap on the dashboard showing which days the user read verses. Gamifies the experience and encourages daily engagement.

**Why**: Streak mechanics are proven engagement drivers. The `user_progress` table already tracks `current_streak` and `last_activity_date`, but it's not visualized well.

**Changes**:
- Create `StreakCalendar` component with a 12-week heatmap grid
- Create a new `reading_activity` table: id, user_id, date, verses_read_count, chapters_visited
- Add the calendar to the Dashboard page
- Track activity automatically when users visit verse pages (update `ShlokDetailPage` to log reads)

---

## Feature 5: "Explore by Mood" - Emotion-Based Verse Discovery

**What it does**: A visual, emoji-based mood selector on the homepage and problems page. Users tap their current mood (Anxious, Sad, Angry, Confused, Grateful, Peaceful) and get curated verses matching that emotion.

**Why**: Many users don't know chapter numbers or specific problems. Mood is the most intuitive entry point. The `problems` table already has categories that map well to emotions.

**Changes**:
- Create `MoodSelector` component with 6-8 emotion cards (emoji + label)
- Map each mood to existing problem categories/slugs in the database
- Add the mood selector to the homepage (between HeroSection and StatsSection)
- Route to the matching problem detail page or show filtered results

---

## Implementation Priority

| Priority | Feature | Complexity | Impact |
|----------|---------|-----------|--------|
| 1 | WhatsApp/Social Share | Low | High |
| 2 | Explore by Mood | Low | High |
| 3 | Ask About This Verse | Medium | High |
| 4 | Reading Streak Calendar | Medium | Medium |
| 5 | Bookmark Collections | High | Medium |

---

## Technical Details

### Feature 1 - Share Buttons
| File | Action |
|------|--------|
| `src/components/ui/share-buttons.tsx` | New - reusable share component |
| `src/components/home/DailyWisdom.tsx` | Update Share2 button to use share-buttons |
| `src/components/shlok/ShareWisdomCard.tsx` | Add WhatsApp share option |

### Feature 2 - Bookmark Collections
| File | Action |
|------|--------|
| Migration SQL | New table `bookmark_collections` and `collection_items` |
| `src/hooks/useCollections.ts` | New hook for CRUD |
| `src/components/dashboard/CollectionManager.tsx` | New component |
| `src/components/dashboard/SavedWisdomCard.tsx` | Update to show collections |

### Feature 3 - Contextual Verse Chat
| File | Action |
|------|--------|
| `src/components/shlok/VerseChat.tsx` | New inline chat component |
| `src/pages/ShlokDetailPage.tsx` | Add VerseChat below actions |
| `supabase/functions/gita-coach/index.ts` | Add verse_context parameter support |

### Feature 4 - Streak Calendar
| File | Action |
|------|--------|
| Migration SQL | New table `reading_activity` |
| `src/components/dashboard/StreakCalendar.tsx` | New heatmap component |
| `src/pages/DashboardPage.tsx` | Add StreakCalendar section |
| `src/pages/ShlokDetailPage.tsx` | Track verse reads on visit |

### Feature 5 - Mood Selector
| File | Action |
|------|--------|
| `src/components/home/MoodSelector.tsx` | New component with emoji cards |
| `src/pages/Index.tsx` | Add MoodSelector after HeroSection |

### Branding Fix
| File | Action |
|------|--------|
| `src/components/layout/Footer.tsx` | Change "AI Gita Coach" to "Talk to Krishna" (line 126) |
| `src/components/layout/Header.tsx` | Change "AI Coach" to "Talk to Krishna" (line 51) |
| `src/components/home/FeaturesGrid.tsx` | Change "AI Gita Coach" to "Talk to Krishna" (line 21) |

