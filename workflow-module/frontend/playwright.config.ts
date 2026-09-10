import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration — Workflow Module E2E Tests
 *
 * Usage:
 *   npx playwright test                          # all tests, headless
 *   npx playwright test --headed                 # headed (shows browser)
 *   npx playwright test --debug                  # debug mode
 *   npx playwright test e2e/workflow-module.spec.ts  # single file
 *   E2E_BASE_URL=http://staging.erp.com npx playwright test
 */
export default defineConfig({
  testDir:   './e2e',
  fullyParallel: false,   // workflows have shared state (sequential for correctness)
  retries:   process.env.CI ? 2 : 0,
  workers:   1,           // single worker to avoid race conditions on shared DB data
  reporter:  [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL:    process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
    trace:      'on-first-retry',
    // Default timeout per action
    actionTimeout:     10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  // Auto-start the Next.js dev server before tests (comment out for CI with pre-deployed app)
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 60_000,
  // },
})
