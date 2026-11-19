import { defineConfig } from '@playwright/test'

// E2E runs against the production build (vite preview) so the service worker is real.
// Two iPhone-sized viewports, as required by SPEC §0.3.7.
const iphone = { deviceScaleFactor: 3, isMobile: true, hasTouch: true }

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4173', locale: 'nl-BE', timezoneId: 'Europe/Brussels' },
  projects: [
    { name: 'iphone-390', use: { ...iphone, viewport: { width: 390, height: 844 } } },
    { name: 'iphone-430', use: { ...iphone, viewport: { width: 430, height: 932 } } },
  ],
  webServer: {
    // The e2e build talks to the ijzer-dev Supabase project (src/data/supabase/config.ts).
    command: 'npm run build:e2e && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
})
