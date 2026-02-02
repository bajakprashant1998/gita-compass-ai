# Implementation Plan: Admin Auth Fix + Enhanced Gita Coach System Prompt

## Status: ✅ COMPLETED

## Overview

This plan addressed two issues:
1. **Admin data not loading on page refresh** - Fixed race condition where data was fetched before auth token was ready
2. **Enhanced Gita Coach AI** - Upgraded system prompt with comprehensive 6-part framework

---

## Part 1: Fix Admin Data Loading on Refresh ✅

### Changes Made

**File 1: `src/contexts/AdminAuthContext.tsx`**
- Added `isReady: boolean` to context type and state
- Modified `refreshSession()` to use the returned session data
- Added 100ms delay to ensure token propagation
- Set `isReady(true)` after auth is complete
- Exported `isReady` in context value

**File 2: `src/pages/admin/AdminDashboard.tsx`**
- Imported `useAdminAuthContext`
- Added `isReady` check in `useEffect` before loading stats

**File 3: `src/pages/admin/AdminShlokList.tsx`**
- Imported `useAdminAuthContext`  
- Added `isReady` check in `useEffect` before loading data

---

## Part 2: Enhanced Gita Coach System Prompt ✅

**File: `supabase/functions/gita-coach/index.ts`**

Replaced system prompt with comprehensive 6-part framework:
1. Problem Understanding
2. Gita-Based Analysis
3. Solution Framework
4. Actionable Master Plan
5. Guidance for the Future
6. Modern Context Integration

---

## Expected Results

- **Admin refresh**: Login → Dashboard shows data → Refresh → Data loads correctly ✅
- **Gita Coach**: More structured responses with actionable plans and modern context ✅
