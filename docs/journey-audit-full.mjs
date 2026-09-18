import { chromium } from "@playwright/test";
import { writeFileSync } from "fs";

const BASE = "http://localhost:3000";

async function capture(page, label, extra = {}) {
  const url = page.url();
  const headings = await page.locator("h1, h2, h3, h4").allTextContents();
  const visibleButtons = await page.locator("button:visible, a:visible").evaluateAll((els) =>
    els.slice(0, 120).map((el) => ({
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 100),
      href: el.getAttribute("href") || "",
    })).filter((x) => x.text || x.href),
  );
  const mainText = await page.locator("body").innerText().catch(() => "");
  return {
    label,
    url,
    headings: headings.map((h) => h.trim()).filter(Boolean).slice(0, 20),
    visibleButtons,
    mainTextExcerpt: mainText.replace(/\s+/g, " ").slice(0, 1500),
    ...extra,
  };
}

async function clickText(page, name, opts = {}) {
  const link = page.getByRole("link", { name, exact: opts.exact ?? false });
  const btn = page.getByRole("button", { name, exact: opts.exact ?? false });
  if (await link.count()) {
    await link.first().click({ timeout: 15000 });
    await page.waitForTimeout(opts.wait ?? 2500);
    return "link";
  }
  if (await btn.count()) {
    await btn.first().click({ timeout: 15000 });
    await page.waitForTimeout(opts.wait ?? 2500);
    return "button";
  }
  return null;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const steps = [];

  try {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 90000 });
    const step1 = await capture(page, "1. Landing page — first screen");
    const productLinksOnHome = await page.locator('a[href*="/shop/product-details/"]').count();
    step1.notes = {
      firstScreenIsFullHeightHero: true,
      heroHeadline: "Endless Style",
      heroSubtext: "short plans, long compliments",
      heroPrimaryCTA: "Find Your Next Fit",
      heroSecondaryCTA: "List Items",
      productCardsVisibleWithoutScrolling: productLinksOnHome,
      navLinksIncludeShop: step1.visibleButtons.some((b) => b.text === "Shop"),
    };
    steps.push(step1);

    await clickText(page, "Find Your Next Fit");
    const step2 = await capture(page, "2. Shop page — after Find Your Next Fit");
    step2.notes = {
      pageHeading: "Shop amazing / Style Brands",
      listingsSection: "Available Listings",
      filtersVisible: step2.mainTextExcerpt.includes("Filters"),
    };
    steps.push(step2);

    await page.waitForTimeout(3000);
    const card = page.getByText("Rent from", { exact: false }).first();
    await card.scrollIntoViewIfNeeded();
    await page.locator("text=Rent from").first().click({ force: true });
    await page.waitForURL(/product-details/, { timeout: 20000 });
    steps.push(await capture(page, "3. Product detail — opened from shop card click"));

    const rentCTA =
      (await clickText(page, "Rent", { wait: 1500 })) ||
      (await clickText(page, "Choose Rental Period", { wait: 1500 })) ||
      (await clickText(page, "Check Availability", { wait: 1500 }));

    steps.push(await capture(page, "4. Product — rental side panel / primary action", { openedVia: rentCTA }));

    const check = await clickText(page, "Check Availability", { wait: 4000 });
    steps.push(await capture(page, "5. After Check Availability (logged out)", { clickedCheckAvailability: !!check }));

    await page.goto(`${BASE}/shop/cart`, { waitUntil: "networkidle" });
    steps.push(await capture(page, "6. Your cart"));

    await page.goto(`${BASE}/auth/sign-in`, { waitUntil: "networkidle" });
    steps.push(await capture(page, "7. Sign in"));

    await page.goto(`${BASE}/auth/create-account`, { waitUntil: "networkidle" });
    steps.push(await capture(page, "8. Create account — choose role"));

    writeFileSync(
      "/Users/kingsley/Projects/RLSTD_V1/RELISTED-frontend1/docs/journey-audit-full.json",
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
