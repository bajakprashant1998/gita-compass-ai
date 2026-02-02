

# Fix: Enable Content Publishing on Admin Pages

## Problem Identified

The admin pages are accessible (UI auth bypassed), but **database operations fail** because Row Level Security (RLS) policies still require an authenticated admin user.

| Layer | Current State | Issue |
|-------|---------------|-------|
| Frontend (UI) | Auth bypassed | Pages accessible |
| Database (RLS) | Auth required | INSERT/UPDATE blocked |

When `createShlok()` or `updateShlok()` is called, the database checks `has_role(auth.uid(), 'admin')` which returns `false` because there's no authenticated user session.

---

## Solution Options

### Option A: Re-enable Admin Authentication (Recommended for Production)
Restore proper authentication so RLS policies work correctly.

### Option B: Create Service Role Bypass (For Development/Testing)
Use an Edge Function with service role key to bypass RLS for admin operations.

### Option C: Modify RLS Policies Temporarily (Quick Fix - Less Secure)
Add a more permissive policy for development purposes.

---

## Recommended Approach: Option B - Service Role Edge Function

This approach maintains security while allowing development access:

1. **Create an Edge Function** `admin-crud` that uses the service role key
2. **Modify adminApi.ts** to call this function instead of direct Supabase calls
3. **Edge Function handles** INSERT, UPDATE, DELETE operations server-side

### Architecture:

```text
Admin UI (no auth)
       │
       ▼
Edge Function (admin-crud)
  Uses: SUPABASE_SERVICE_ROLE_KEY
       │
       ▼
Database (bypasses RLS)
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/admin-crud/index.ts` | Create | Handle admin CRUD operations |
| `src/lib/adminApi.ts` | Modify | Call Edge Function instead of direct DB |

---

## Implementation Details

### 1. New Edge Function: `admin-crud`

```typescript
// Handles: shloks, problems, chapters CRUD
// Operations: create, update, delete
// Uses service role to bypass RLS
```

**Endpoints:**
- `POST /admin-crud` with body `{ table, operation, data, id }`
  - `table`: 'shloks' | 'problems' | 'chapters' | etc.
  - `operation`: 'create' | 'update' | 'delete'
  - `data`: Record to insert/update
  - `id`: Record ID (for update/delete)

### 2. Modified API Functions

Update `createShlok()`, `updateShlok()`, `deleteShlok()` to:
- Call the Edge Function instead of direct Supabase client
- Pass operation type and data
- Handle responses and errors

---

## Security Considerations

- Edge Function runs server-side with elevated privileges
- No authentication check in Edge Function (for dev purposes)
- **Before production**: Add proper authentication to Edge Function
- Service role key is never exposed to client

---

## Alternative Quick Fix (If Needed Immediately)

If you need an immediate fix without Edge Function changes, you could:

1. **Sign in as admin** before performing operations
2. The existing login page at `/admin/login` still works
3. Even with AdminProtectedRoute bypassed, signing in establishes a session
4. RLS policies will then work correctly

This is the simplest path: just log in with your admin account (cadbull2014@gmail.com) and the publish functionality will work.

---

## Recommendation

**For immediate use**: Sign in at `/admin/login` with your admin credentials - this establishes an auth session that satisfies RLS policies.

**For development convenience**: Implement the Edge Function approach to bypass auth entirely for local testing.

