import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:3000';

// playwright-bdd reads the .feature files and generates Playwright spec files in .features-gen
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'steps/**/*.ts',
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Locally the default (half the cores) starts 6 browsers at once; on this machine the first
  // parallel wave then ran 3-10x slower and missed the 5s expect timeout. 3 was stable cold.
  workers: process.env.CI ? 1 : 3,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results' }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Start the app under test. Locally an already running instance is reused.
  webServer: [
    {
      command: 'npm start',
      cwd: '../..',
      url: `${API_URL}/api-docs.yaml`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      // Production build served by vite preview. The dev server re-optimizes dependencies on its
      // first load and reloads pages mid-test, which makes parallel runs flaky (ERR_ABORTED).
      command: 'npm run build && npm run preview -- --port 5173 --strictPort',
      cwd: '../../frontend',
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
