import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', timeout: 60000, workers: 1,
  use: { baseURL: process.env.CRM_BROWSER_URL || 'http://127.0.0.1:3008', headless: true, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  reporter: [['list'], ['html', { open: 'never' }]],
  webServer: process.env.CRM_VERIFY_LIVE === 'true' ? {
    command: 'node scripts/launch.mjs start',
    url: `${process.env.CRM_BROWSER_URL}/crm`, reuseExistingServer: false, timeout: 60000,
  } : undefined,
});
