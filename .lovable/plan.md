
# Enhance Chat Page - "Talk to Krishna"

## Overview
Rebrand the chat page from "AI Wisdom Guide" to "Talk to Krishna", simplify the UI for all user types, and improve clarity and accessibility.

## Changes

### 1. Rebrand to "Talk to Krishna"
- Change the header title from `AI Wisdom Guide` to `Talk to Krishna`
- Update SEO title/description to reflect the new branding
- Update typing indicator messages to Krishna-themed: "Krishna is thinking...", "Finding a verse for you...", "Preparing wisdom..."
- Update placeholder text to "Ask Krishna anything..."

### 2. Simplify the Conversation Starters (MultiLanguageStarters)
- Add a friendly subtitle: "Krishna is here to guide you. Just ask."
- Replace the Sparkles icon with a more relatable Krishna/lotus icon or keep Sparkles but add a warm "Hare Krishna" greeting
- Make prompt buttons larger with clearer text for non-technical users

### 3. Simplify Quick Actions Bar
- Make labels always visible (remove `hidden sm:inline` so mobile users can also read labels)
- Slightly larger touch targets for mobile users
- Reduce the number of quick actions to 4 most essential ones for less cognitive overload

### 4. Improve Input Area UX
- Clearer placeholder: "Ask Krishna anything about life..."
- Hide character counter until user is near the limit (e.g., show only after 400/500 chars)
- Make the send button more prominent with a label on desktop: "Ask" text next to the icon

### 5. Better Visual Hierarchy
- Reduce decorative clutter (remove FloatingOm overlay on starters, reduce blur effects)
- Cleaner message bubbles with less gradient complexity
- Add a subtle Krishna avatar for assistant messages instead of generic Sparkles icon

## Technical Details

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/ChatPage.tsx` | Rebrand title, update typing messages, placeholder, simplify decorative elements, improve input area |
| `src/components/chat/MultiLanguageStarters.tsx` | Update heading text, simplify layout for clarity |
| `src/components/chat/QuickActionsBar.tsx` | Show labels on mobile, reduce to 4 actions, larger touch targets |
| `src/components/SEOHead.tsx` | No change needed (props-based) |

### Branding Changes
- "AI Wisdom Guide" -> "Talk to Krishna" (header)
- "AI Gita Coach" -> "Talk to Krishna" (SEO)
- Typing messages themed around Krishna
- Warmer, more personal tone throughout
