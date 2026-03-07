

## Admin Panel Loading Issues - Full Debugging Audit & Fix Plan

### Root Cause Analysis

The console logs reveal the exact failure chain:

```text
Login Flow (broken):
1. signInWithPassword → 200 OK ✅
2. navigate('/admin') → AdminAuthProvider mounts
3. initAuth() → getSession() HANGS (known Supabase race condition)
4. 8-second timeout fires → checks sessionStorage cache → EMPTY
5. Sets isLoading=false, isReady=false, user=null
6. AdminProtectedRoute sees no user → redirects to /admin/login
7. onAuthStateChange fires AFTER redirect (too late)

Result: Login stuck in redirect loop, dashboard never loads
```

**Why `getSession()` hangs**: The Supabase client is still processing the `signInWithPassword` token internally when `getSession()` is called immediately after navigation. This is a known race condition.

**Why cache fallback fails**: `AdminLoginPage.handleSubmit` does NOT set the admin cache before navigating. Only the `useEffect` (existing session check) sets it. So after fresh login + timeout, cache is empty.

### Fix Plan (3 files)

#### 1. Fix `AdminLoginPage.tsx` - Verify admin role & set cache BEFORE navigating

- After `signInWithPassword` succeeds, use the returned session to verify admin role via direct REST fetch (same pattern as `checkAdminRole`)
- Set admin cache with `setAdminCache(userId)` on success
- Only navigate to `/admin` after verification passes
- Show "Access denied" if user is not an admin instead of navigating

#### 2. Fix `AdminAuthContext.tsx` - Make auth initialization resilient

- **Remove the problematic `getSession()` call with timeout** as the primary mechanism
- Instead, use `onAuthStateChange` as the SOLE auth mechanism (Supabase docs recommend this pattern)
- On mount: check cache first for immediate rendering, then let `onAuthStateChange` (which fires on mount with `INITIAL_SESSION` event) handle the real verification
- When `onAuthStateChange` fires with a session, verify admin role and update state
- When it fires with no session and no cache, redirect to login
- Add a shorter safety timeout (3s) that only applies if NO auth event has been received at all

#### 3. Fix `AdminProtectedRoute.tsx` - Remove React ref warning

- The console shows "Function components cannot be given refs" for `Navigate` component - minor cleanup

### Technical Details

The key architectural change is switching from:
```text
OLD: initAuth() → getSession() [hangs] → timeout → give up
```
to:
```text
NEW: onMount → check cache for instant UI → onAuthStateChange fires → verify role → update state
```

This eliminates the `getSession()` hanging issue entirely since `onAuthStateChange` is event-driven and doesn't hang. The Supabase client guarantees it fires at least once on setup with `INITIAL_SESSION`.

### Files to modify
- `src/pages/admin/AdminLoginPage.tsx` - Add admin verification before navigation
- `src/contexts/AdminAuthContext.tsx` - Rewrite to use onAuthStateChange-first pattern
- `src/components/admin/AdminProtectedRoute.tsx` - Minor cleanup

