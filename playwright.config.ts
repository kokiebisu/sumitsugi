import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for tsumugi E2E tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'playwright-results.xml' }],
    ['json', { outputFile: 'playwright-results.json' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on', // Record all tests (success + failure)
    actionTimeout: 15000,
    navigationTimeout: 30000,
    locale: 'ja-JP',
  },

  /* Configure projects for major browsers and viewports */
  projects: [
    /* Desktop browsers */
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Mobile viewports for payment flow testing */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Tablet viewport */
    {
      name: 'tablet',
      use: { ...devices['iPad (gen 7)'] },
    },

    /* Payment-specific project with longer timeouts */
    {
      name: 'payment',
      testMatch: '**/payment/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Longer timeout for Stripe API calls
        actionTimeout: 30000,
        navigationTimeout: 60000,
      },
    },
  ],

  /* Run local dev server before tests */
  webServer: {
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  /* Global test timeout */
  timeout: 60000,

  /* Expect timeout */
  expect: {
    timeout: 10000,
  },

  /* Output folder for artifacts */
  outputDir: 'tests/e2e/artifacts',
});
