import { defineConfig, devices } from "@playwright/test";

/** Bundled Chromium from `bun run e2e:install` (CI / headless servers). Default: system Google Chrome. */
const useBundledChromium = process.env.PLAYWRIGHT_BUNDLED === "1";
const isCi = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  workers: isCi ? 2 : undefined,
  timeout: isCi ? 30_000 : 45_000,
  reporter: isCi ? [["list"], ["html", { open: "never" }]] : "html",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    navigationTimeout: 15_000,
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: "smoke",
      grep: /@smoke/,
      use: {
        ...devices["Desktop Chrome"],
        ...(!useBundledChromium ? { channel: "chrome" as const } : {}),
      },
    },
    {
      name: "chromium",
      grepInvert: /@slow/,
      use: {
        ...devices["Desktop Chrome"],
        ...(!useBundledChromium ? { channel: "chrome" as const } : {}),
      },
    },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !isCi,
    timeout: 120_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_API_BASE_URL:
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3999",
    },
  },
});
