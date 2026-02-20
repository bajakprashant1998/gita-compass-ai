import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      // 'prompt' means: install SW silently but do NOT auto-reload tabs
      // when a new version is found. The old SW keeps serving until the
      // user navigates or closes the tab — preventing the "auto refresh" bug.
      registerType: 'prompt',
      includeAssets: ['logo.png'],
      manifest: false, // Using public/manifest.json
      workbox: {
        // Only cache static assets — NOT HTML navigation requests.
        // This prevents the SW from intercepting page navigations and
        // issuing surprise reloads when the cache becomes stale.
        globPatterns: ['**/*.{js,css,ico,png,svg,woff2}'],
        // Prevent Workbox from generating a navigateFallback handler
        // which can cause infinite redirect loops on some hosts.
        navigateFallback: null,
        navigateFallbackDenylist: [/^\/~oauth/, /^\/admin/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/glxupcdgtzqkaxcgezeu\.supabase\.co\/rest\/v1\/(chapters|shloks|problems)/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
