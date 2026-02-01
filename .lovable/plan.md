
# Remove Admin Authentication (Temporary)

## Overview
Bypass all admin authentication temporarily so you can preview and test all admin pages without logging in. The auth infrastructure will remain in place for easy re-integration later.

---

## Changes Required

### 1. Simplify AdminProtectedRoute
Make the component a simple pass-through that renders children immediately without any auth checks.

**File:** `src/components/admin/AdminProtectedRoute.tsx`
- Remove all auth logic, navigation redirects, and loading states
- Simply render `{children}` directly

### 2. Update App.tsx Routes
- Remove the `/admin/login` route (or redirect it to dashboard)
- Keep the `AdminProtectedRoute` wrapper structure so re-enabling auth later is easy

### 3. Update AdminHeader
- Hide/modify the sign-out button since there's no logged-in user
- Show a placeholder for the admin avatar

### 4. Update AdminSidebar
- Disable/hide the sign-out link at the bottom

---

## Result
After these changes:
- Navigate directly to `/admin` to see the dashboard
- All admin pages (`/admin/shloks`, `/admin/problems`, etc.) work without login
- Login page redirects to dashboard instead of showing a form

---

## Re-enabling Auth Later
When ready to add auth back:
1. Restore the `AdminProtectedRoute` logic
2. Re-enable the login route
3. Uncomment sign-out functionality

The auth hook and login page code will be preserved for easy restoration.
