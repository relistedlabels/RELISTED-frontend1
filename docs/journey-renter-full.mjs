import { chromium } from "@playwright/test";
import { execSync } from "child_process";
import { writeFileSync } from "fs";

const BASE = "http://localhost:3000";
const RENTER_EMAIL = "renter@gmail.com";
const RENTER_ID = "4ddb7d5a-0845-4921-b322-6b4f4a7bca3f";
const PASSWORD = "111111";
const PRODUCT_ID = "295fe193-b867-43ce-92f6-e7405eb0520b";
const DB = "postgresql://relisted:your_secure_password@localhost:5432/relisted";

function psqlOne(sql) {
  return execSync(`psql "${DB}" -t -A -c "${sql.replace(/"/g, '\\"')}"`, {
    encoding: "utf8",
  }).trim();
}

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
  return { label, url, excerpt: body.slice(0, 2400), buttons, ...extra };
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
    steps.push(await capture(page, "A. Signed in as renter@gmail.com"));

    await page.goto(`${BASE}/shop/product-details/${PRODUCT_ID}`, { waitUntil: "networkidle" });
    steps.push(await capture(page, "B. Product detail (logged in)"));

    await page.getByRole("button", { name: "Rent now" }).click();
    await page.waitForTimeout(2000);
    steps.push(await capture(page, "C. Choose rental period panel"));

    const check = page.getByRole("button", { name: /Check Availability/i });
    if (await check.count()) await check.first().click();
    await page.waitForTimeout(5000);
    steps.push(await capture(page, "D. After Check Availability"));

    const reqId = psqlOne(
      `SELECT id FROM "AvailabilityRequest" WHERE "requesterId"='${RENTER_ID}' ORDER BY "createdAt" DESC LIMIT 1`,
    );
    psqlOne(
      `UPDATE "AvailabilityRequest" SET status='ACCEPTED', "approvedAt"=NOW() WHERE id='${reqId}'`,
    );
    steps.push({ label: "E. DB lister approve", requestId: reqId });

    await page.goto(`${BASE}/shop/cart`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    steps.push(await capture(page, "F. Cart after approval"));

    await page.goto(`${BASE}/shop/cart/checkout`, { waitUntil: "networkidle" });
    await page.waitForTimeout(6000);
    steps.push(await capture(page, "G. Checkout loaded"));

    await page.getByText(/Terms of Service Agreement/i).click();
    await page.waitForTimeout(1000);

    const complete = page.getByRole("button", { name: /complete order/i });
    if (await complete.isEnabled()) {
      await complete.click();
      await page.waitForTimeout(8000);
      steps.push(await capture(page, "H. After Complete Order"));
    } else {
      steps.push(await capture(page, "H. Complete Order still disabled"));
    }

    await page.goto(`${BASE}/renters/orders`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    steps.push(await capture(page, "I. My orders"));

    const firstOrder = page.locator('a[href*="/renters/orders/"]').first();
    if (await firstOrder.count()) {
      const href = await firstOrder.getAttribute("href");
      await firstOrder.click();
      await page.waitForTimeout(4000);
      steps.push(await capture(page, "J. Order detail", { href }));

      for (const name of [/confirm delivery/i, /confirm receipt/i]) {
        const b = page.getByRole("button", { name });
        if (await b.count()) {
          await b.first().click();
          await page.waitForTimeout(4000);
          steps.push(await capture(page, "K. After delivery/receipt confirm"));
          break;
        }
      }

      const rr = page.getByRole("button", { name: /ready to return/i });
      if (await rr.count()) {
        await rr.first().click();
        await page.waitForTimeout(2000);
        steps.push(await capture(page, "L. Ready to return modal"));
      }
    }

    writeFileSync(
      "/Users/kingsley/Projects/RLSTD_V1/RELISTED-frontend1/docs/journey-renter-full.json",
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
