import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vitest/config'
import pkg from './package.json' with { type: 'json' }

// https://vite.dev/config/
/**
 * The global headers from public/_headers (Cloudflare), also applied by `vite preview`, so the
 * e2e tests run with the same Content-Security-Policy as production.
 */
function productionHeaders(): Record<string, string> {
  const block =
    readFileSync(new URL('./public/_headers', import.meta.url), 'utf8').split(/^\/\S+$/m)[1] ?? ''
  return Object.fromEntries(
    block
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.includes(': '))
      .map((line) => [line.slice(0, line.indexOf(': ')), line.slice(line.indexOf(': ') + 2)]),
  )
}

export default defineConfig({
  preview: { headers: productionHeaders() },
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registered in src/app/pwa.ts so we control update checks.
      injectRegister: false,
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'IJZER',
        short_name: 'IJZER',
        description: 'Log je training in seconden, zie of je sterker wordt, en begrijp waarom.',
        lang: 'nl-BE',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#111110',
        theme_color: '#111110',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell + exercise catalog are precached: the app works fully offline.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}', 'data/*.json'],
        navigateFallback: '/index.html',
        // Exercise photos (±20 MB) are cached the first time they are shown.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/exercises/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'exercise-images',
              expiration: { maxEntries: 1600 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
