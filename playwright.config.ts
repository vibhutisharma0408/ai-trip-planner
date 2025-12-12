import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./tests/e2e",
  use: {
    headless: true,
    baseURL: "http://localhost:3000"
  },
  webServer: {
    command: "npm run dev",
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI
  }
};

export default config;

