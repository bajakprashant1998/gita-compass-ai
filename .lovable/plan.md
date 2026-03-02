

## Plan: Android App via PWA with Mobile Optimization

Your project already has a solid PWA foundation (manifest, service worker, vite-plugin-pwa). To make it a polished installable Android app, here's what needs to be done:

### 1. Add PWA Install Prompt & `/install` Page
- Create `src/pages/InstallPage.tsx` with step-by-step install instructions for Android (and iOS)
- Create `src/hooks/useInstallPrompt.ts` to capture the `beforeinstallprompt` event and trigger native install dialog
- Add an "Install App" button in the Header and a smart banner that appears on mobile devices

### 2. Enhance manifest.json for Android
- Add `maskable` icon entries (required for Android adaptive icons)
- Add `screenshots` array for richer install UI on Android
- Add `shortcuts` for quick actions (Chat, Chapters, Problems)
- Set `"id": "/"` for stable PWA identity

### 3. Mobile UI Polish
- Add `viewport-fit=cover` meta tag for edge-to-edge display
- Add `apple-mobile-web-app-title` meta tag
- Ensure the status bar blends with the app theme using proper `theme-color`
- Add a standalone-mode CSS check to hide browser-specific UI when running as installed app

### 4. Add Route for Install Page
- Register `/install` route in `App.tsx`

### Files
| Action | File |
|--------|------|
| Create | `src/pages/InstallPage.tsx` |
| Create | `src/hooks/useInstallPrompt.ts` |
| Edit | `public/manifest.json` — add maskable icons, shortcuts, screenshots |
| Edit | `index.html` — add `viewport-fit=cover`, standalone detection |
| Edit | `src/App.tsx` — add `/install` route |
| Edit | `src/components/layout/Header.tsx` — add "Install App" CTA on mobile |

No backend changes needed.

