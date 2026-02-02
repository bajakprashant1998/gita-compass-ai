

# Fix Admin Login and "Verifying Access..." Issues

## Problem Summary

There are two interconnected issues preventing the admin panel from working correctly:

1. **Login Page Stuck**: The login button stays on "Signing in..." forever
2. **Protected Routes Stuck**: The admin panel shows "Verifying access..." indefinitely

The root cause is a conflict between two separate authentication systems running simultaneously.

---

## Root Cause Analysis

### Current Architecture (Broken)

```text
AdminAuthProvider (creates auth state #1)
    └── AdminLoginPage
            └── useAdminAuth() hook (creates auth state #2)
                    └── signIn() updates state #2, not state #1
```

When you click "Sign In":
1. The `useAdminAuth()` hook's `signIn()` function runs
2. It updates its **own local state** (not the context)
3. The context never knows the login succeeded
4. Protected routes still see `isLoading: true` from the context
5. Result: Login appears stuck, and navigation fails

### Why Tab Switching Causes Issues

When the browser tab is backgrounded:
- Multiple auth listeners may stop responding
- When you return, the context's `getSession()` may hang
- Without a visibility change handler, `isLoading` stays `true` forever

---

## Solution

Unify all admin authentication into a single source of truth - the `AdminAuthContext`.

### Changes Required

| File | Change | Purpose |
|------|--------|---------|
| `src/pages/admin/AdminLoginPage.tsx` | Use `useAdminAuthContext()` instead of `useAdminAuth()` | Single auth source |
| `src/hooks/useAdminAuth.tsx` | Keep for standalone use, simplify | Backward compatibility |

### Architecture After Fix

```text
AdminAuthProvider (single auth state)
    ├── AdminLoginPage
    │       └── useAdminAuthContext() ← reads/writes to shared state
    │
    └── AdminProtectedRoute
            └── useAdminAuthContext() ← same shared state
```

Now when you click "Sign In":
1. The context's `signIn()` function runs
2. It updates the **shared context state**
3. Protected routes immediately see the updated state
4. Navigation works correctly

---

## Implementation Details

### Step 1: Update AdminLoginPage

Change the import and hook usage:

**Before:**
```typescript
import { useAdminAuth } from '@/hooks/useAdminAuth';
// ...
const { signIn, isLoading, isAdmin, user } = useAdminAuth();
```

**After:**
```typescript
import { useAdminAuthContext } from '@/contexts/AdminAuthContext';
// ...
const { signIn, isLoading, isAdmin, user } = useAdminAuthContext();
```

The rest of the component stays the same - the API is identical.

### Step 2: Keep useAdminAuth for Standalone Use

The `useAdminAuth` hook can remain for cases where components need admin auth outside the provider (unlikely but possible). No changes needed here.

### Step 3: Verify Context Has All Features

The `AdminAuthContext` already has:
- `visibilitychange` listener for tab switching
- Proper `signIn()` and `signOut()` functions
- `onAuthStateChange` subscription
- Role verification via `has_role` RPC

---

## Why This Fixes Both Issues

### Login Flow
| Step | Before (Broken) | After (Fixed) |
|------|-----------------|---------------|
| Click Sign In | Hook updates local state | Context updates shared state |
| Redirect check | Reads from hook (different state) | Reads from context (same state) |
| Protected route | Context still loading | Context already authenticated |

### Tab Switching
| Step | Before (Broken) | After (Fixed) |
|------|-----------------|---------------|
| Return to tab | Multiple listeners, race conditions | Single visibility handler |
| Session refresh | May never complete | Always updates shared state |
| UI update | `isLoading` stays true | `isLoading` properly set to false |

---

## Summary

The fix is simple: make `AdminLoginPage` use the same context as `AdminProtectedRoute`.

**One-line change:**
```typescript
// In AdminLoginPage.tsx
import { useAdminAuthContext } from '@/contexts/AdminAuthContext';
const { signIn, isLoading, isAdmin, user } = useAdminAuthContext();
```

This ensures all admin components share the same auth state, eliminating race conditions and stuck loading states.

