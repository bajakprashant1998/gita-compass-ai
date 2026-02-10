
# Visual Enhancement Plan for 6 Pages

## 1. Home Page (`Index.tsx` + `HeroSection.tsx`)

### HeroSection Enhancements
- Add a subtle animated particle/sparkle effect in the background using CSS keyframes (floating dots of light)
- Add a rotating "verse of the day" teaser below the quick prompts showing a short Sanskrit snippet that fades in/out
- Add a pulsing "Live" indicator next to "AI-Powered Ancient Wisdom" badge to convey activity
- Improve the quick prompts with emoji prefixes for visual scanning (e.g., "I feel anxious about my future")
- Add a subtle typewriter/placeholder animation on the textarea cycling through example problems

### Index Page Section Polish
- Wrap all lazy sections in a single Suspense with a more elegant skeleton (gradient shimmer instead of plain gray pulse)
- Add subtle section dividers between components using decorative SVG wave or gradient borders

## 2. Chapters Page (`ChaptersPage.tsx`)

### Enhancements
- Add a "reading progress" mini-bar on each chapter card showing how many verses the user has read (if logged in), otherwise hide
- Add a subtle hover parallax effect on chapter cards (the chapter number shifts slightly)
- Improve the empty search state with a friendly illustration/icon and better copy
- Add a "Start Your Journey" highlighted card for Chapter 1 if user hasn't read any chapters
- Add alternating subtle background tints on cards for visual rhythm

## 3. Chapter Detail Page (`ChapterDetailPage.tsx`)

### Enhancements
- Add a chapter summary quote/key verse highlight at the top of the verses section (pull the first verse's meaning as a featured quote)
- Add a sticky chapter navigation bar that appears on scroll showing "Chapter X - Title" with prev/next buttons
- Add progress indicator showing "You've read X of Y verses" if user is logged in
- Improve the view toggle buttons with better active states and smooth icon transitions
- Add a "Jump to verse" number input for chapters with many verses

## 4. Shlok Detail Page (`ShlokDetailPage.tsx`)

### Enhancements
- Add a decorative Sanskrit watermark behind the verse section (large faded Om or the verse number in Devanagari)
- Improve the section navigation dots on the right with active state tracking using IntersectionObserver
- Add a "Key Insight" callout card between the meaning and problem sections - a single bold sentence summary
- Add subtle entrance animations (stagger) for each section as user scrolls
- Improve the chapter progress bar at the bottom with verse thumbnails/dots for quick navigation

## 5. Problems Page (`ProblemsPage.tsx`)

### Enhancements
- Add an animated gradient border that "breathes" on the Problem Matcher card to draw attention
- Add hover micro-interactions: the icon rotates slightly and the card border glows in its theme color
- Add a "Most Popular" section at the top showing the top 3 problems as larger featured cards before the grid
- Add a search/filter input above the grid (in addition to Emotion Cloud) for text-based filtering
- Improve the verse count display with a small progress-bar style indicator

## 6. Chat Page (`ChatPage.tsx`) - Writing Box Redesign

### Major Input Box Redesign
- Replace the standard textarea with a modern "composer" style input:
  - Rounded pill/capsule shape with a frosted glass background
  - The send button integrated inside the input area (right side) instead of separate
  - Voice button on the left side of the input
  - Expandable: starts as a single line, grows as user types (up to 4 lines)
  - Floating above the chat with a subtle shadow, not attached to the card border
- Add a subtle gradient glow ring around the input when focused
- Add suggestion chips that appear above the input when chat is empty (replacing the current quick actions bar location - move them inside the empty state)
- Add a "typing indicator" that's more visually interesting (animated Krishna emoji with wave dots)

### Chat Area Polish
- Add a subtle background pattern (very faint mandala or geometric pattern) to the chat area
- Improve message bubble shapes: user messages get a tail pointing right, assistant messages get a tail pointing left
- Add a smooth scroll animation when new messages arrive

---

## Technical Implementation Details

### Files to Modify
1. `src/components/home/HeroSection.tsx` - Typewriter placeholder, emoji prompts, live badge
2. `src/pages/Index.tsx` - Better skeleton shimmer
3. `src/pages/ChaptersPage.tsx` - Card hover effects, journey card
4. `src/pages/ChapterDetailPage.tsx` - Sticky nav, featured quote, jump-to-verse
5. `src/pages/ShlokDetailPage.tsx` - Watermark, active section tracking, key insight
6. `src/pages/ProblemsPage.tsx` - Featured problems, animated border, search input
7. `src/pages/ChatPage.tsx` - Complete input redesign, chat area pattern
8. `src/index.css` - New animations (shimmer, typewriter, breathing border)

### New CSS Animations to Add
- `shimmer` - gradient shimmer for loading skeletons
- `typewriter` - cycling placeholder text effect
- `breathe` - pulsing border glow for attention-drawing
- `float-gentle` - softer floating animation for decorative elements

### No New Dependencies Required
All enhancements use existing Tailwind, Radix, and Lucide icons. The typewriter effect uses a simple `useState` + `useEffect` interval pattern.
