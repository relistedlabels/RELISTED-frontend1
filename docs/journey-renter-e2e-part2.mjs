import { chromium } from "@playwright/test";
import { writeFileSync } from "fs";

const BASE = "http://localhost:3000";
const RENTER_EMAIL = "renter@gmail.com";
const RENTER_ID = "4ddb7d5a-0845-4921-b322-6b4f4a7bca3f";
const PASSWORD = "111111";

async function capture(page, label, extra = {}) {
  const url = page.url();
  const body = (await page.locator("body").innerText()).replace(/\s+/g, " ").trim();
  const buttons = await page.locator("button:visible, a:visible").evaluateAll((els) =>
    els.slice(0, 80).map((el) => ({
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 90),
      href: el.getAttribute("href") || "",
    })).filter((x) => x.text || x.href),
  );
  return { label, url, excerpt: body.slice(0, 2200), buttons, ...extra };
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
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const steps = [];

  try {
    await login(page);
    steps.push(await capture(page, "10. Logged in"));

    await page.goto(`${BASE}/shop/cart`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    steps.push(await capture(page, "11. Cart with approved item"));

    await page.goto(`${BASE}/shop/cart/checkout`, { waitUntil: "networkidle" });
    await page.waitForTimeout(5000);
    steps.push(await capture(page, "12. Checkout page"));

    const payPatterns = [/pay now/i, /complete order/i, /place order/i, /confirm and pay/i, /pay from wallet/i];
    for (const re of payPatterns) {
      const btn = page.getByRole("button", { name: re });
      if (await btn.count()) {
        await btn.first().click();
        await page.waitForTimeout(6000);
        steps.push(await capture(page, "13. After pay click", { button: re.source }));
        break;
      }
    }

    await page.goto(`${BASE}/renters/orders`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    steps.push(await capture(page, "14. My orders list"));

    const orderLink = page.locator('a[href*="/renters/orders/"]').first();
    if (await orderLink.count()) {
      const href = await orderLink.getAttribute("href");
      await orderLink.click();
      await page.waitForTimeout(4000);
      steps.push(await capture(page, "15. Order detail", { orderHref: href }));

      const confirmDelivery = page.getByRole("button", { name: /confirm delivery/i });
      if (await confirmDelivery.count()) {
        await confirmDelivery.first().click();
        await page.waitForTimeout(3000);
        steps.push(await capture(page, "16. After confirm delivery click"));
      }

      const readyReturn = page.getByRole("button", { name: /ready to return/i });
      if (await readyReturn.count()) {
        await readyReturn.first().click();
        await page.waitForTimeout(2000);
        steps.push(await capture(page, "17. Ready to return modal opened"));
      }
    }

    writeFileSync(
      "/Users/kingsley/Projects/RLSTD_V1/RELISTED-frontend1/docs/journey-renter-e2e-part2.json",
      JSON.stringify(steps, null, 2),
    );
    console.log(JSON.stringify(steps, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
