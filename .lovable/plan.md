

# Dashboard Health Check and Fix Plan

## Issues Found

### 1. Sign Out Button - Still Potentially Broken
The sign-out code looks correct after the last fix, but there's a race condition: when `signOut()` clears the user state immediately, the `useEffect` in `DashboardPage` detects `!user` and calls `navigate('/auth')` -- which competes with the `handleSignOut` calling `navigate('/')`. The user may end up on `/auth` instead of `/` because the `useEffect` fires before `handleSignOut` completes.

**Fix**: Add a `signingOut` ref/state to prevent the auth redirect from firing during sign-out.

### 2. AuthPage - setState During Render (Console Warning)
Lines 22-26 of `AuthPage.tsx` call `navigate('/dashboard')` during render (not inside a `useEffect`). This causes the React warning: "Cannot update a component while rendering a different component."

**Fix**: Move the redirect into a `useEffect`.

### 3. FloatingOm - Ref Warning
`FloatingOm` is a function component that receives a ref somewhere (likely from a parent). It doesn't use `forwardRef`.

**Fix**: Wrap `FloatingOm` with `React.forwardRef` or ensure no parent passes a ref to it.

### 4. Preferences Card - `onLanguageChange` Type Mismatch
`PreferencesCard` declares `onLanguageChange` as `(lang: string) => void` (sync), but `DashboardPage` passes an `async` function. The `handleLanguageToggle` in `PreferencesCard` uses `await` on it, but since the return type is `void` (not `Promise<void>`), errors won't propagate to the catch block.

**Fix**: Update the prop type to `(lang: string) => Promise<void>`.

### 5. SavedWisdomCard - Missing "View All" Link
When there are more than 4 favorites, only the first 4 are shown with no way to see the rest.

**Fix**: Add a "View All" link/button when `favorites.length > 4`.

### 6. StreakCalendar - No Empty State
If the user has no reading activity, the heatmap shows all gray squares with no guidance.

**Fix**: Add a subtle prompt when `activities` is empty.

---

## Technical Implementation

### File: `src/pages/DashboardPage.tsx`
- Add a `useRef(false)` called `isSigningOut` to track sign-out state.
- In `handleSignOut`, set `isSigningOut.current = true` before calling `signOut()`.
- In the `useEffect` redirect, check `!isSigningOut.current` before navigating to `/auth`.

### File: `src/pages/AuthPage.tsx`
- Remove the inline `if (user) { navigate('/dashboard'); return null; }` block.
- Replace with a `useEffect` that navigates when `user` is truthy.
- Return loading/null state while redirecting.

### File: `src/components/ui/decorative-elements.tsx`
- Wrap `FloatingOm` with `React.forwardRef` to eliminate the ref warning.

### File: `src/components/dashboard/PreferencesCard.tsx`
- Change `onLanguageChange` prop type from `(lang: string) => void` to `(lang: string) => Promise<void>`.
- Change `onDailyWisdomChange` prop type from `(enabled: boolean) => void` to `(enabled: boolean) => Promise<void>`.

### File: `src/components/dashboard/SavedWisdomCard.tsx`
- Add a "View All Saved Verses" button/link below the list when `favorites.length > 4`.

### File: `src/components/dashboard/StreakCalendar.tsx`
- Add a motivational empty state message when no activities exist (e.g., "Start reading to build your streak!").

---

## Summary

| Component | Issue | Severity |
|-----------|-------|----------|
| Sign Out flow | Race condition with auth redirect | High |
| AuthPage | setState during render | Medium |
| FloatingOm | Missing forwardRef | Low |
| PreferencesCard | Async prop type mismatch | Low |
| SavedWisdomCard | No "View All" option | Low |
| StreakCalendar | No empty state guidance | Low |

All fixes are small, targeted changes that don't alter the overall architecture.
