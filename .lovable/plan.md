

# SEO Metadata Management System

## Overview
Build a complete SEO management system in the admin panel, and ensure every page has unique Open Graph metadata. This involves two parts: (1) a database-backed SEO editor for admins, and (2) ensuring all pages properly use unique OG tags.

## Part 1: Database Schema

### New Table: `page_seo_metadata`
Stores SEO metadata for all page types in one unified table.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| page_type | text | "chapter", "shlok", "problem", or "static" |
| page_identifier | text | Chapter ID, Shlok ID, problem slug, or static page path (e.g., "/", "/chat", "/problems") |
| meta_title | text | Custom SEO title |
| meta_description | text | Custom SEO description |
| meta_keywords | text[] | Array of keywords |
| og_image | text | Optional custom OG image URL |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

RLS: Admins can manage, anyone can read (needed for frontend to fetch SEO data).

### Add SEO columns to existing tables
Add `meta_title`, `meta_description`, `meta_keywords` columns directly to the `chapters`, `shloks`, and `problems` tables for simpler queries (avoids extra join on every page load).

**Chosen approach**: Add columns directly to `chapters`, `shloks`, and `problems` tables, plus a `page_seo_metadata` table for static pages. This is simpler and faster for content pages.

## Part 2: Admin Panel - SEO Management

### A. SEO fields in existing edit forms
Add an "SEO" tab/section to:
- **AdminChapterForm** - meta_title, meta_description, meta_keywords fields
- **AdminShlokForm** - meta_title, meta_description, meta_keywords fields
- **AdminProblemForm** - meta_title, meta_description, meta_keywords fields

Each SEO section includes:
- Character count indicators (title: 60 char recommended, description: 160 char recommended)
- Color-coded length indicators (green/yellow/red)
- Google SERP preview showing how the page will appear in search results

### B. New "SEO" admin page for static pages
A dedicated admin page (`/admin/seo`) to manage SEO for non-content pages:
- Homepage (`/`)
- Chat page (`/chat`)
- Problems listing (`/problems`)
- Chapters listing (`/chapters`)
- Contact page (`/contact`)
- Donate page (`/donate`)
- Dashboard (`/dashboard`)

### C. Reusable SEO Editor Component
A shared `AdminSEOFields` component used across all forms with:
- Meta title input with character counter
- Meta description textarea with character counter
- Keywords tag input
- Live Google SERP preview box

## Part 3: Frontend - Unique OG Tags Per Page

### Current State
The `SEOHead` component already sets unique OG tags per page using `react-helmet-async`. This works for Google (which executes JavaScript). 

### Enhancement
- Update `ChapterDetailPage`, `ShlokDetailPage`, `ProblemDetailPage` to fetch and use admin-defined SEO metadata from the database
- Ensure every page sets a unique `og:url` with the correct canonical URL
- Fall back to auto-generated SEO data if admin hasn't set custom values

### Important Note on Social Crawlers
Facebook and some social crawlers do NOT execute JavaScript, so they only see the `index.html` default meta tags. This is a fundamental limitation of single-page applications (SPAs). To fully solve this would require server-side rendering (SSR), which is not supported in React+Vite on this platform. **However**, Google's crawler fully supports JavaScript and will see the correct per-page metadata. For Facebook sharing, a workaround would be a dedicated "share preview" edge function in the future.

## Part 4: Files to Create/Modify

| File | Action |
|------|---------|
| **Migration SQL** | Add `meta_title`, `meta_description`, `meta_keywords` to chapters, shloks, problems tables. Create `page_seo_metadata` table for static pages. |
| `src/components/admin/AdminSEOFields.tsx` | **New** - Reusable SEO editor with char counters and SERP preview |
| `src/pages/admin/AdminSEOPages.tsx` | **New** - Static pages SEO management page |
| `src/pages/admin/AdminChapterForm.tsx` | Add SEO tab with AdminSEOFields |
| `src/pages/admin/AdminShlokForm.tsx` | Add SEO tab with AdminSEOFields |
| `src/pages/admin/AdminProblemForm.tsx` | Add SEO tab with AdminSEOFields |
| `src/components/admin/AdminRoutes.tsx` | Add route for `/admin/seo` |
| `src/components/admin/AdminSidebar.tsx` | Add "SEO" nav item |
| `src/hooks/usePageSEO.ts` | **New** - Hook to fetch SEO metadata for any page |
| `src/pages/ShlokDetailPage.tsx` | Use custom SEO data from DB if available |
| `src/pages/ChapterDetailPage.tsx` | Use custom SEO data from DB, add proper canonical URL |
| `src/pages/ProblemDetailPage.tsx` | Use custom SEO data from DB, add proper canonical URL |
| `src/pages/ChaptersPage.tsx` | Use custom SEO data if available |
| `src/pages/ChatPage.tsx` | Use custom SEO data if available |
| `src/lib/adminApi.ts` | Add CRUD functions for page_seo_metadata |

## Technical Details

### AdminSEOFields Component
```text
+------------------------------------------+
| SEO Settings                             |
+------------------------------------------+
| Meta Title                               |
| [Bhagavad Gita Chapter 3 - Karm...]  45/60 |
|                                          |
| Meta Description                         |
| [Explore the teachings of Chapter...]  120/160 |
|                                          |
| Keywords                                 |
| [karma] [yoga] [duty] [+ Add]           |
|                                          |
| --- Google Preview ---                   |
| Bhagavad Gita Chapter 3 - Karma Yoga    |
| bhagavadgitagyan.com > chapters > 3      |
| Explore the teachings of Chapter 3...    |
+------------------------------------------+
```

### Character Limit Colors
- Green: Within optimal range
- Yellow: Approaching limit (title > 50, description > 140)
- Red: Over limit (title > 60, description > 160)

### Data Flow
When a content page loads:
1. Fetch content data (chapter/shlok/problem) - already has meta_title, meta_description, meta_keywords columns
2. If custom SEO fields are set, use them in SEOHead
3. If not set, fall back to auto-generated values (current behavior)

For static pages:
1. `usePageSEO` hook queries `page_seo_metadata` by path
2. If found, override default SEOHead props
3. If not found, use hardcoded defaults

