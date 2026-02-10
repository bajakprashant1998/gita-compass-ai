

# Chat Page Mobile Enhancement Plan

## Current Issues on Mobile (390px)

1. **Header is cramped** -- The "Talk to Krishna" header, language selector, and action buttons wrap awkwardly on small screens with too much horizontal content
2. **Conversation starters take too much space** -- The 4-category grid renders as a single column, pushing the input area way below the fold; users must scroll to type
3. **Composer input area** -- The voice button, textarea, and send button row is tight; helper text ("Enter to send") is irrelevant on mobile (no physical keyboard)
4. **Chat height calculation** -- `h-[calc(100vh-12rem)]` doesn't account for mobile header/footer properly, causing scroll issues
5. **User/assistant avatars** -- 40px avatars eat horizontal space on small screens, reducing message width
6. **Quick actions bar** -- The pill buttons wrap to 2-3 rows taking up valuable vertical space in conversation mode
7. **No mobile history access** -- The History button is `hidden md:flex`, so mobile users can't access past conversations

## Proposed Fixes

### 1. Compact Mobile Header
- Stack title and controls vertically on mobile: title row on top, controls row below
- Make the language selector smaller on mobile (icon-only mode)
- Add a History icon button visible on mobile that opens ChatHistorySidebar as a drawer/sheet overlay

### 2. Compact Conversation Starters
- On mobile, show only 2 categories (most popular: "Inner Peace" and "Life Decisions") with 1 prompt each
- Add a "Show all topics" expandable button to reveal the full grid
- Reduce spacing and padding for mobile

### 3. Optimized Composer
- Remove keyboard helper text on mobile entirely
- Reduce padding in the composer area on mobile
- Make voice and send buttons slightly smaller (h-9 w-9) on mobile for more typing space

### 4. Better Height Calculation
- Use different `calc()` values for mobile vs desktop using responsive classes
- Account for mobile browser chrome and safe areas

### 5. Smaller Avatars on Mobile
- Reduce avatar size from 40px to 32px on mobile (`w-8 h-8 md:w-10 md:h-10`)
- Increase max message width to 92% on mobile

### 6. Compact Quick Actions
- On mobile, show quick actions as a horizontal scrollable row (no wrapping) to save vertical space
- Use smaller padding and text

### 7. Mobile Chat History Access
- Show History button on mobile
- Open ChatHistorySidebar as a bottom sheet/drawer overlay on mobile instead of a sidebar

## Files to Modify

1. **`src/pages/ChatPage.tsx`** -- Header layout, height calc, avatar sizes, composer mobile tweaks, mobile history drawer, helper text hide
2. **`src/components/chat/MultiLanguageStarters.tsx`** -- Collapsible categories on mobile, reduced spacing
3. **`src/components/chat/QuickActionsBar.tsx`** -- Horizontal scroll row on mobile instead of wrapping

## Technical Details

### ChatPage.tsx Changes
- Header: Split into two rows on mobile using `flex-col sm:flex-row`
- Height: Change to `h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)]`
- Avatars: `w-8 h-8 md:w-10 md:h-10` and `rounded-lg md:rounded-xl`
- Message max width: `max-w-[92%] sm:max-w-[85%]`
- Composer padding: `p-3 md:p-4`
- Voice/send buttons: `h-9 w-9 md:h-10 md:w-10`
- Helper text: Add `hidden sm:flex` to the keyboard hint row
- History button: Remove `hidden md:flex`, add a Sheet/Drawer wrapper for mobile that shows the ChatHistorySidebar content

### MultiLanguageStarters.tsx Changes
- Heading: Reduce size on mobile (`text-xl md:text-2xl`)
- Reduce margin/padding (`mb-5 md:mb-8`, `p-2 md:p-4`)
- On mobile, initially show only 2 categories; add a "More topics" button to expand
- Use `useState` to track expanded state

### QuickActionsBar.tsx Changes
- Change from `flex-wrap` to `flex overflow-x-auto scrollbar-hide` on mobile
- Add `flex-nowrap` and `snap-x` for horizontal scroll
- Add `whitespace-nowrap` on buttons to prevent text wrapping
- Reduce button padding on mobile: `px-3 py-2 md:px-4 md:py-2.5`

