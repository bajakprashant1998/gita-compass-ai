
# Implementation Plan: Admin Auth Fix + Enhanced Gita Coach System Prompt

## Overview

This plan addresses two issues:
1. **Admin data not loading on page refresh** - A race condition where data is fetched before the auth token is ready
2. **Enhanced Gita Coach AI** - Upgrade the system prompt with your comprehensive 6-part framework

---

## Part 1: Fix Admin Data Loading on Refresh

### Problem
When an admin refreshes the page, the dashboard shows zeros/empty data because:
- The `AdminAuthContext` restores the session from cache
- It calls `refreshSession()` but proceeds without waiting for the new token to propagate
- Child components start fetching data with a stale token

### Solution
Add an `isReady` state that signals when auth is fully complete, and have child components wait for it.

### Files to Modify

**File 1: `src/contexts/AdminAuthContext.tsx`**

Changes:
- Add `isReady: boolean` to the context type and state (initial: `false`)
- After `refreshSession()` succeeds, use the **returned session** (not the original cached one)
- Add a small 100ms delay to ensure token propagation
- Set `isReady(true)` only after everything is complete
- Export `isReady` in the context value

```text
Context Type:
  + isReady: boolean

Initialization Flow:
  1. getSession() -> check if user exists
  2. refreshSession() -> wait for NEW session data
  3. Use refreshedSession.user (not original session.user)
  4. Wait 100ms for token propagation
  5. checkAdminRole()
  6. setIsReady(true)
  7. setIsLoading(false)
```

**File 2: `src/pages/admin/AdminDashboard.tsx`**

Changes:
- Import `useAdminAuthContext`
- Add `isReady` check in `useEffect` before calling `loadStats()`

```typescript
const { isReady } = useAdminAuthContext();

useEffect(() => {
  if (!isReady) return;  // Wait for auth
  loadStats();
}, [isReady]);
```

**File 3: `src/pages/admin/AdminShlokList.tsx`**

Changes:
- Import `useAdminAuthContext`
- Add `isReady` to the dependency array of `useEffect`

```typescript
const { isReady } = useAdminAuthContext();

useEffect(() => {
  if (!isReady) return;  // Wait for auth
  loadData();
}, [isReady, filters]);
```

---

## Part 2: Enhanced Gita Coach System Prompt

### Current State
The `gita-coach` edge function has a basic 25-line prompt focused on being a "calm, wise mentor" with a few key teachings.

### Enhancement
Replace with your comprehensive 6-part framework covering:
1. Problem Understanding
2. Gita-Based Analysis  
3. Solution Framework
4. Actionable Master Plan
5. Guidance for the Future
6. Modern Context Integration

**File: `supabase/functions/gita-coach/index.ts`**

Replace lines 9-33 (`SYSTEM_PROMPT` constant) with:

```typescript
const SYSTEM_PROMPT = `You are an AI assistant trained on the Bhagavad Gita (all 18 chapters, 700+ verses).

Core Responsibilities:

Problem Understanding
- Carefully understand the user's problem shared in the chat.
- Identify the emotional, mental, practical, and ethical dimensions of the issue.

Gita-Based Analysis
- Analyze the user's problem in depth using relevant verses from across all 18 chapters.
- Interpret the verses accurately and in their proper philosophical context.
- Do not provide solutions that contradict the teachings of the Gita.

Solution Framework
- Provide a clear, practical solution strictly aligned with the Bhagavad Gita.
- Explain why this solution works by connecting it to the Gita's teachings (karma, dharma, detachment, devotion, self-knowledge, discipline, etc.).

Actionable Master Plan
- Create a step-by-step master plan describing what the user should do next.
- The plan should be realistic, progressive, and easy to follow.
- Each step must reflect principles taught in the Gita.

Guidance for the Future
- Suggest how the user can apply these teachings in daily life going forward.
- Encourage self-discipline, clarity of duty, balance, and inner stability.

Modern Context Integration (Next-Level Guidance)
- When appropriate, combine the timeless wisdom of the Bhagavad Gita with current trends, modern lifestyles, and real-world challenges (career, relationships, mental health, technology, stress, decision-making, etc.).
- Ensure modern suggestions never conflict with the core philosophy of the Gita.

Response Style Guidelines:
- Be calm, wise, compassionate, and non-judgmental.
- Avoid preaching; focus on clarity and practical wisdom.
- Use simple, clear English that is accessible to all users.
- Maintain depth without being overly complex.
- When referencing verses, format as: "Chapter X, Verse Y" and briefly explain the teaching.`;
```

---

## Summary of Changes

| File | Type | Purpose |
|------|------|---------|
| `src/contexts/AdminAuthContext.tsx` | Modify | Add `isReady` state, fix token timing |
| `src/pages/admin/AdminDashboard.tsx` | Modify | Wait for `isReady` before fetching |
| `src/pages/admin/AdminShlokList.tsx` | Modify | Wait for `isReady` before fetching |
| `supabase/functions/gita-coach/index.ts` | Modify | Replace system prompt with comprehensive version |

---

## Expected Results

After implementation:
- **Admin refresh**: Login -> Dashboard shows data -> Refresh -> Data loads correctly
- **Gita Coach**: More structured responses with actionable plans and modern context
