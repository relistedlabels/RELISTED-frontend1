import { chromium } from "@playwright/test";
import { execSync } from "child_process";
import { writeFileSync } from "fs";

const BASE = "http://localhost:3000";
const RENTER_EMAIL = "renter@gmail.com";
const PASSWORD_CANDIDATES = ["111111", "11111111"];
const PRODUCT_ID = "295fe193-b867-43ce-92f6-e7405eb0520b"; // Tailored Wide-Leg Trousers 180
const DB =
  "postgresql://relisted:your_secure_password@localhost:5432/relisted";
const RENTER_ID = "4ddb7d5a-0845-4921-b322-6b4f4a7bca3f";

async function capture(page, label, extra = {}) {
  const url = page.url();
  const body = (await page.locator("body").innerText()).replace(/\s+/g, " ").trim();
  const buttons = await page.locator("button:visible, a:visible").evaluateAll((els) =>
    els.slice(0, 60).map((el) => ({
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 90),
      href: el.getAttribute("href") || "",
    })).filter((x) => x.text || x.href),
  );
  return {
    label,
    url,
    excerpt: body.slice(0, 1800),
    buttons,
    ...extra,
  };
}

function psql(sql) {
  return execSync(`psql "${DB}" -t -A -c ${JSON.stringify(sql)}`, {
    encoding: "utf8",
  }).trim();
}

function approveLatestPendingRequest(requesterId) {
  const id = psql(`
    SELECT id FROM "AvailabilityRequest"
    WHERE "requesterId" = '${requesterId}' AND status IN ('PENDING', 'EXPIRED')
    ORDER BY "createdAt" DESC LIMIT 1;
  `);
  if (!id) return { approved: false, reason: "no pending request found" };
  psql(`
    UPDATE "AvailabilityRequest"
    SET status = 'ACCEPTED', "approvedAt" = NOW()
    WHERE id = '${id}';
  `);
  return { approved: true, requestId: id };
}

async function tryLogin(page) {
  for (const password of PASSWORD_CANDIDATES) {
    await page.goto(`${BASE}/auth/sign-in`, { waitUntil: "networkidle" });
    await page.getByPlaceholder(/email/i).or(page.locator('input[name="email"]')).first().fill(RENTER_EMAIL);
    await page.getByPlaceholder(/password/i).or(page.locator('input[name="password"]')).first().fill(password);
    await page.getByRole("button", { name: /^Sign in$/i }).click();
    await page.waitForTimeout(3000);
    if (!page.url().includes("/auth/sign-in")) {
      return { ok: true, passwordLength: password.length };
    }
  }
  return { ok: false };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const steps = [];

  try {
    const login = await tryLogin(page);
    steps.push(await capture(page, "A. After sign-in attempt", { login }));
    if (!login.ok) throw new Error("Login failed with 6 or 8 ones");

    await page.evaluate((userId) => {
      localStorage.setItem(
        `relisted-onboarding:renter:${userId}`,
        JSON.stringify({ step: 0, completedAt: new Date().toISOString() }),
      );
    }, RENTER_ID);

    await page.goto(`${BASE}/shop/product-details/${PRODUCT_ID}`, {
      waitUntil: "networkidle",
    });
    steps.push(await capture(page, "B. Product detail (logged in)"));

    await page.getByRole("button", { name: "Rent now" }).click();
    await page.waitForTimeout(2000);
    steps.push(await capture(page, "C. Choose rental period panel opened"));

    const checkBtn = page.getByRole("button", { name: /Check Availability/i });
    if (await checkBtn.count()) {
      await checkBtn.first().click();
      await page.waitForTimeout(4000);
    } else {
      const sendBtn = page.getByRole("button", { name: /Send request/i });
      if (await sendBtn.count()) {
        await sendBtn.first().click();
        await page.waitForTimeout(4000);
      }
    }
    steps.push(await capture(page, "D. After Check Availability / Send request"));

    const approve = approveLatestPendingRequest(RENTER_ID);
    steps.push({ label: "E. DB — lister approve simulated", db: approve });

    await page.goto(`${BASE}/shop/cart`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    steps.push(await capture(page, "F. Your cart after approval"));

    const checkoutLink = page.getByRole("link", { name: /checkout|proceed|pay/i }).or(
      page.getByRole("button", { name: /checkout|proceed|pay/i }),
    );
    if (await checkoutLink.count()) {
      await checkoutLink.first().click();
      await page.waitForTimeout(4000);
    } else {
      await page.goto(`${BASE}/shop/cart/checkout`, { waitUntil: "networkidle" });
      await page.waitForTimeout(3000);
    }
    steps.push(await capture(page, "G. Checkout page"));

    const payBtn = page.getByRole("button", { name: /pay|complete|place order|confirm/i });
    if (await payBtn.count()) {
      await payBtn.first().click();
      await page.waitForTimeout(5000);
      steps.push(await capture(page, "H. After pay attempt"));
    }

    const latestOrder = psql(`
      SELECT "orderId", status FROM "Order"
      WHERE "userId" = '${RENTER_ID}'
      ORDER BY "createdAt" DESC LIMIT 1;
    `);
    steps.push({ label: "I. DB — latest order", db: { latestOrder: latestOrder || null } });

    if (latestOrder) {
      const orderId = latestOrder.split("|")[0];
      await page.goto(`${BASE}/renters/orders/${orderId}`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(3000);
      steps.push(await capture(page, "J. Renter order detail (latest)"));
    }

    writeFileSync(
      "/Users/kingsley/Projects/RLSTD_V1/RELISTED-frontend1/docs/journey-renter-e2e.json",
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
