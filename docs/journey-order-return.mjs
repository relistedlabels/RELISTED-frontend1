import { chromium } from "@playwright/test";
import { writeFileSync } from "fs";

const BASE = "http://localhost:3000";
const RENTER_EMAIL = "renter@gmail.com";
const RENTER_ID = "4ddb7d5a-0845-4921-b322-6b4f4a7bca3f";
const PASSWORD = "111111";
const NEW_ORDER = "ORD-1789202566757-560";
const RETURN_DUE_ORDER = "ORD-1782389116077-314";

async function capture(page, label, extra = {}) {
  const body = (await page.locator("body").innerText()).replace(/\s+/g, " ").trim();
  return { label, url: page.url(), excerpt: body.slice(0, 2400), ...extra };
}

async function login(page) {
  await page.goto(`${BASE}/auth/sign-in`, { waitUntil: "networkidle" });
  await page.locator('input[name="email"]').fill(RENTER_EMAIL);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: /^Sign in$/i }).click();
  await page.waitForTimeout(3000);
  await page.evaluate((userId) => {
    localStorage.setItem(
      `relisted-onboarding:renter:${userId}`,
      JSON.stringify({ step: 0, completedAt: new Date().toISOString() }),
    );
  }, RENTER_ID);
  if (page.url().includes("/onboarding")) {
    await page.getByRole("button", { name: /skip tour/i }).click();
    await page.waitForTimeout(1500);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const steps = [];
  await login(page);

  await page.goto(`${BASE}/renters/orders/${NEW_ORDER}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(4000);
  steps.push(await capture(page, "J. New order detail"));

  await page.goto(`${BASE}/renters/orders/${RETURN_DUE_ORDER}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(4000);
  steps.push(await capture(page, "K. Return-due order detail"));

  const rr = page.getByRole("button", { name: /ready to return/i });
  if (await rr.count()) {
    await rr.first().click();
    await page.waitForTimeout(2500);
    steps.push(await capture(page, "L. Ready to return modal"));
  }

  writeFileSync(
    "/Users/kingsley/Projects/RLSTD_V1/RELISTED-frontend1/docs/journey-order-return.json",
    JSON.stringify(steps, null, 2),
  );
  console.log(JSON.stringify(steps, null, 2));
  await browser.close();
}

main();
