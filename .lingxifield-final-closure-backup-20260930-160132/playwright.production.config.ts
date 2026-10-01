import { defineConfig, devices } from "playwright/test";
export default defineConfig({
  testDir: "./tests/final-closure",
  testMatch: /production\.spec\.ts/,
  timeout: 45000,
  retries: 1,
  use: { ...devices["Desktop Chrome"], trace: "retain-on-failure" },
});
