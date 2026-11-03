import { defineConfig, devices } from '@playwright/test';
const password = process.env.E2E_PASSWORD ?? 'local-e2e-password-2026';
const externalServer = process.env.E2E_BASE_URL;
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 30000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: externalServer ?? 'http://127.0.0.1:3210', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: externalServer
    ? undefined
    : {
        command: 'npm run start',
        url: 'http://127.0.0.1:3210/login',
        reuseExistingServer: false,
        timeout: 60000,
        env: {
          PORT: '3210',
          HOSTNAME: '127.0.0.1',
          DEMO_MODE: 'true',
          DEMO_PASSWORD: password,
          APP_ORIGIN: 'http://127.0.0.1:3210',
          DATABASE_PATH: 'data/e2e-' + process.pid + '.sqlite',
          NEXT_TELEMETRY_DISABLED: '1',
        },
      },
});
