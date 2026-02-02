
# Implementation Plan: Logo, Favicon, GTM & Donate Button Fix

This plan covers three main tasks: fixing the donate button toggle, replacing the logo/favicon, and adding Google Tag Manager.

---

## Task 1: Fix Donate Button Toggle (Admin Setting Not Working)

**Problem Identified**: The RLS (Row Level Security) policy on the `admin_settings` table only allows users with the 'admin' role to read settings. When an anonymous visitor (or non-admin user) visits the site, the query to fetch `show_donate_button` fails due to RLS, causing the Header to default to showing the button.

**Solution**: Add a public read policy for non-sensitive settings like `show_donate_button`.

**Database Migration Required**:
```sql
-- Allow public to read non-secret settings (like show_donate_button)
CREATE POLICY "Public can read non-secret settings"
ON public.admin_settings
FOR SELECT
TO public
USING (is_secret = false);
```

---

## Task 2: Replace Logo Throughout Website

**Current State**: The logo is a triangular saffron flag (Bhagwa Dhwaj) SVG component.

**New Logo**: Om symbol with flute and peacock feather (provided image).

**Files to Modify**:

| File | Change |
|------|--------|
| `public/logo.png` | Copy uploaded image here |
| `src/components/ui/bhagwa-flag.tsx` | Replace with image component |
| `src/components/layout/Header.tsx` | Update logo usage |
| `src/components/layout/Footer.tsx` | Update logo usage |
| `src/pages/admin/AdminLoginPage.tsx` | Update logo usage |
| `src/components/admin/AdminSidebar.tsx` | Update admin logo |

**Implementation Approach**:
- Copy the uploaded logo to `public/logo.png`
- Create a new `Logo` component that renders an `<img>` tag
- Replace all `BhagwaFlag` usages with the new `Logo` component

---

## Task 3: Update Favicon

**File**: `index.html` and `public/favicon.png`

**Changes**:
- Copy uploaded image to `public/favicon.png`
- Update `index.html` to reference the new favicon

---

## Task 4: Add Google Tag Manager Code

**File**: `index.html`

**Changes**:
- Add GTM head script immediately after `<head>` tag
- Add GTM noscript after opening `<body>` tag

---

## Summary of Changes

| File | Action |
|------|--------|
| `public/logo.png` | Create (copy from uploaded image) |
| `public/favicon.png` | Create (copy from uploaded image) |
| `src/components/ui/bhagwa-flag.tsx` | Replace SVG with image-based Logo component |
| `src/components/layout/Header.tsx` | Update component import |
| `src/components/layout/Footer.tsx` | Update component import |
| `src/pages/admin/AdminLoginPage.tsx` | Update component import |
| `src/components/admin/AdminSidebar.tsx` | Update admin sidebar logo |
| `index.html` | Add GTM scripts + update favicon reference |
| Database | Add RLS policy for public read on non-secret settings |

---

## Technical Details

### New Logo Component

```typescript
// src/components/ui/bhagwa-flag.tsx (renamed conceptually to Logo)
interface LogoProps {
  className?: string;
}

export function BhagwaFlag({ className }: LogoProps) {
  return (
    <img 
      src="/logo.png" 
      alt="Bhagavad Gita Gyan" 
      className={className}
    />
  );
}
```

### GTM Code in index.html

```html
<head>
  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-ML97X8GS');</script>
  <!-- End Google Tag Manager -->
  
  <meta charset="UTF-8" />
  ...
</head>
<body>
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-ML97X8GS"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->
  
  <div id="root"></div>
  ...
</body>
```

### RLS Policy for Public Settings Read

```sql
CREATE POLICY "Public can read non-secret settings"
ON public.admin_settings
FOR SELECT
TO public
USING (is_secret = false);
```

---

## Verification Steps

After implementation:

1. **Donate Toggle**: 
   - Go to Admin Settings, toggle off "Show Donate Button", click Save
   - Visit the main site - Donate button should be hidden
   - Toggle on again, save - button should reappear

2. **New Logo**: 
   - Check Header on all pages shows new Om symbol logo
   - Check Footer shows new logo
   - Check Admin Login page shows new logo
   - Check Admin Sidebar shows new logo

3. **Favicon**: 
   - Open site in new tab - favicon should show new Om symbol

4. **GTM**: 
   - Open browser DevTools Network tab
   - Check for requests to `googletagmanager.com`
   - Verify GTM container loads successfully
