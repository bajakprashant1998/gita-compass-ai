

# Implementation Plan: 4 Features

## 1. Admin Web Stories Manager

Create `src/pages/admin/AdminWebStories.tsx` with:
- List view showing all web stories (title, slug, slide count, published status)
- Create/Edit form with a visual slide editor (add/remove/reorder slides)
- Each slide has: text, subtext, verse_ref, gradient selector
- Delete with confirmation
- Uses `admin-crud` edge function for CRUD operations
- Add route in `AdminRoutes.tsx` and nav item in `AdminSidebar.tsx`

## 2. Internal SEO Links on Homepage & Blog

**Homepage** (`src/pages/Index.tsx`): Add a new `SEOInternalLinks` section before CTASection showing links to programmatic pages like `/bhagavad-gita-for-students`, `/bhagavad-gita-on-anxiety`, `/krishna-quotes-on-love`, `/compare`, `/verse/2-47`.

**Blog Post Page** (`src/pages/BlogPostPage.tsx`): Add a "Related Wisdom" sidebar/footer section with links to relevant programmatic pages based on blog tags.

**FeaturesGrid** (`src/components/home/FeaturesGrid.tsx`): Add a feature card linking to `/compare` (Verse Comparison Tool).

## 3. Embeddable Daily Verse Widget

Create `src/pages/EmbedVersePage.tsx` — a standalone, minimal page at `/embed/verse` that:
- Shows today's verse (same deterministic algorithm as DailyWisdom)
- Renders in a compact card format suitable for iframe embedding
- No header/footer/navigation (bare page)
- Includes a "Powered by Bhagavad Gita Gyan" link back

Add an embed code generator section on the homepage or a dedicated `/embed` info page showing the iframe snippet:
```html
<iframe src="https://bhagavadgitagyan.com/embed/verse" width="400" height="300" frameborder="0"></iframe>
```

Add route in `App.tsx`.

## 4. Enhanced Verse Comparison Tool

The comparison tool already exists at `/compare` (`CompareVersesPage.tsx`). Enhancements:
- Add URL-based state so comparisons are shareable (e.g., `/compare?v=2-47,3-19,18-66`)
- Add more presets covering popular themes
- Add a "Shared Themes" analysis section below the comparison grid that highlights common keywords between the compared verses
- Add SEO internal links to related programmatic pages

## Files to Create
- `src/pages/admin/AdminWebStories.tsx`
- `src/pages/EmbedVersePage.tsx`
- `src/components/home/SEOInternalLinks.tsx`

## Files to Modify
- `src/components/admin/AdminRoutes.tsx` — add web stories route
- `src/components/admin/AdminSidebar.tsx` — add web stories nav item
- `src/App.tsx` — add `/embed/verse` route
- `src/pages/Index.tsx` — add SEOInternalLinks section
- `src/pages/BlogPostPage.tsx` — add related programmatic page links
- `src/pages/CompareVersesPage.tsx` — add URL state, more presets, shared themes

No database changes needed — all tables (`web_stories`, `shloks`, etc.) already exist.

