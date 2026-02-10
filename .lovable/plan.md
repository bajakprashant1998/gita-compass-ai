

# Comprehensive Fix and Enhancement Plan

## 1. "Generate All SEO and Save" Button for Static Pages

Add a single button on the `/admin/seo` page that iterates through all static pages, generates SEO metadata via AI, and saves each one automatically.

### Changes:
- **`src/pages/admin/AdminSEOPages.tsx`**: Add a "Generate All and Save" button next to the existing "Bulk Generate SEO" button. This button will:
  - Loop through all 7 static pages
  - Call `generateAIContentWithMeta('generate_seo', ...)` for each
  - Auto-save each result to the database via upsert
  - Show a progress indicator (e.g., "Generating 3/7...")
  - Display a summary toast on completion

## 2. Fix Admin Panel Loading Issues After Tab Switch / Re-open

### Root Cause (from console logs)
The logs show two critical timeout errors:
- `GetSession timed out` (2-second timeout is too aggressive)
- `Verification timed out` (5-second timeout fires during login flow)

The `AdminAuthContext` has overly aggressive timeouts (2s for getSession, 2s for refreshSession, 5s for role check). On slower connections or after tab switches, these fire prematurely and trigger forced logout, clearing tokens and redirecting to login.

### Fix in `src/contexts/AdminAuthContext.tsx`:
1. **Increase timeouts**: getSession to 8s, refreshSession to 8s, role check to 10s
2. **Use sessionStorage cache on init**: If admin cache exists and matches current user, skip the full refresh flow and set `isReady` immediately, then verify in background
3. **Smarter visibility change handler**: Only re-init if the tab was hidden for more than 5 minutes (track timestamp), not on every focus
4. **Remove forced signOut on timeout**: Instead of logging out on timeout, retry once before giving up. Show an error with a "Retry" button instead of silently redirecting

### Fix in `src/pages/admin/AdminLoginPage.tsx`:
- After successful `signInWithPassword`, set the admin cache optimistically before navigating (currently relies on AdminAuthContext to verify, which can race)

## 3. Dashboard and Admin Feature Scan / Bug Fixes

### User Dashboard (`src/pages/DashboardPage.tsx`)
- **StreakCalendar**: Verify `useReadingActivity` hook properly fetches data and handles empty states
- **SavedWisdomCard**: Ensure favorites render correctly when collections feature is available
- **DashboardStats**: Verify all stat counters work (favorites, chapters, verses, streak, chat count)

### Admin Dashboard (`src/pages/admin/AdminDashboard.tsx`)
- **Stats loading**: The dashboard uses `getAdminStats()` with a 10s timeout. If auth isn't ready (due to timeout above), stats fail silently. Fix: ensure the `isReady` gate in useEffect actually prevents premature calls
- **Error display**: Currently shows error message but no retry button on the dashboard itself. Add a "Retry" button

### Admin Forms Scan
- **AdminShlokForm**: Verify SEO fields save correctly via `updateShlok`/`createShlok` (SEO columns were recently added)
- **AdminChapterForm**: Verify SEO fields pass through `updateChapter` API
- **AdminProblemForm**: Verify SEO fields pass through `updateProblem`/`createProblem` API
- **AdminSEOPages**: Verify static page SEO saves correctly via upsert

### Edge Function Verification
- Verify `admin-crud` handles `page_seo_metadata` table operations (it was updated to support this)
- Verify `admin-ai-generate` handles `generate_seo` type correctly

## Technical Summary of All File Changes

| File | Change |
|------|--------|
| `src/pages/admin/AdminSEOPages.tsx` | Add "Generate All and Save" button with progress UI |
| `src/contexts/AdminAuthContext.tsx` | Increase timeouts (2s to 8s), use cache-first init, smarter visibility handler, retry on timeout instead of forced logout |
| `src/pages/admin/AdminLoginPage.tsx` | Set admin cache after successful login before navigating |
| `src/pages/admin/AdminDashboard.tsx` | Add retry button on error state |
| `src/pages/DashboardPage.tsx` | Add error boundary / fallback for each dashboard card |

### Auth Flow After Fix

```text
Login Flow:
  signIn() -> success -> setAdminCache() -> navigate('/admin')
                                              |
                                        AdminAuthContext.initAuth()
                                              |
                                        Cache hit? -> isReady=true immediately
                                              |         (background verify)
                                        No cache -> getSession(8s) -> refreshSession(8s) -> checkRole(10s)
                                              |
                                        Set isReady=true

Tab Switch (< 5 min):
  No action (cache is still valid)

Tab Switch (> 5 min):
  Re-run initAuth() with cache-first approach
```

