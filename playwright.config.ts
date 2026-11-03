import { defineConfig, devices } from '@playwright/test';

/**
 * E2E specs in e2e/. CLAUDE.md: QA and validation run on staging.
 *   - E2E_BASE_URL set (staging or a PR preview URL): tests run against that deployment.
 *   - E2E_BASE_URL unset (CI on pull requests, local): tests run against `vite preview` of the built web app,
 *     so the smoke suite still guards every PR before a staging project exists.
 */
const baseURL = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: baseURL ?? 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  ...(baseURL
    ? {}
    : {
        webServer: {
          command: 'pnpm --filter @benben/web preview --host 127.0.0.1',
          url: 'http://127.0.0.1:5173',
          reuseExistingServer: !process.env.CI,
          timeout: 60_000,
        },
      }),
});
