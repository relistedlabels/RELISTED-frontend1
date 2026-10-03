import { chromium } from "@playwright/test";

const BASE = "http://localhost:3000";
const RENTER_EMAIL = "renter@gmail.com";
const RENTER_ID = "4ddb7d5a-0845-4921-b322-6b4f4a7bca3f";
const PASSWORD = "111111";

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
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await login(page);
  await page.goto(`${BASE}/shop/cart/checkout`, { waitUntil: "networkidle" });
  await page.waitForTimeout(6000);

  const body = await page.locator("body").innerText();
  console.log("URL", page.url());
  console.log("EXCERPT", body.replace(/\s+/g, " ").slice(0, 3500));

  const agree = page.locator('input[type="checkbox"]');
  console.log("checkbox count", await agree.count());
  if (await agree.count()) {
    await agree.first().check({ force: true });
    await page.waitForTimeout(2000);
  }

  const completeBtn = page.getByRole("button", { name: /complete order/i });
  console.log("complete enabled", await completeBtn.isEnabled().catch(() => false));

  const saveBtns = page.getByRole("button", { name: /save|confirm|continue|update/i });
  console.log("action buttons", await saveBtns.allTextContents());

  await browser.close();
}

main();
