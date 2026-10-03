import { chromium } from "@playwright/test";
import { writeFileSync } from "fs";

const BASE = "http://localhost:3000";

async function pageReport(page, label) {
  const url = page.url();
  const title = await page.title();

  const heroText = await page
    .locator("section")
    .first()
    .innerText()
    .catch(() => "");

  const buttons = await page.locator("button, a[href]").evaluateAll((els) =>
    els
      .slice(0, 80)
      .map((el) => {
        const tag = el.tagName.toLowerCase();
        const text = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
        const href = el.getAttribute("href") || "";
        const visible = !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        if (!text && !href) return null;
        if (!visible) return null;
        return { tag, text, href };
      })
      .filter(Boolean),
  );

  const headings = await page.locator("h1, h2, h3").allTextContents();

  return { label, url, title, headings: headings.slice(0, 15), heroText: heroText.slice(0, 500), buttons };
}

async function clickByText(page, text, opts = {}) {
  const loc = page.getByRole("link", { name: text, exact: opts.exact }).or(
    page.getByRole("button", { name: text, exact: opts.exact }),
  );
  const count = await loc.count();
  if (count === 0) return false;
  await loc.first().click({ timeout: 10000 });
  await page.waitForTimeout(opts.wait ?? 2000);
  return true;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const steps = [];

  try {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
    steps.push(await pageReport(page, "Home — first paint"));

    // Hero is full viewport; catalog not visible until CTA or scroll
    const findFitClicked = await clickByText(page, "Find Your Next Fit");
    steps.push({
      ...(await pageReport(page, "After clicking Find Your Next Fit")),
      action: findFitClicked ? "Clicked Find Your Next Fit" : "Find Your Next Fit not found",
    });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    steps.push(await pageReport(page, "Shop — scrolled to listings"));

    // First product card link
    const productHref = await page
      .locator('a[href*="/shop/product-details/"]')
      .first()
      .getAttribute("href")
      .catch(() => null);

    if (productHref) {
      await page.locator(`a[href="${productHref}"]`).first().click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      steps.push({
        ...(await pageReport(page, "Product detail")),
        productHref,
      });

      const checkClicked =
        (await clickByText(page, "Check availability", { exact: false })) ||
        (await clickByText(page, "Check Availability", { exact: false }));

      steps.push({
        ...(await pageReport(page, "After Check availability")),
        action: checkClicked ? "Clicked Check availability" : "Check availability not found or blocked",
      });
    }

    // Nav Shop dropdown path from home
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const shopNav = page.getByRole("button", { name: "Shop" }).or(page.getByText("Shop", { exact: true }));
    if (await shopNav.count()) {
      await shopNav.first().hover().catch(() => {});
      await page.waitForTimeout(800);
    }
    steps.push(await pageReport(page, "Home — nav Shop area"));

    const shopAllLink = page.locator('a[href^="/shop"]').filter({ hasText: /shop|browse|all/i }).first();
    if (await shopAllLink.count()) {
      await shopAllLink.click().catch(() => {});
      await page.waitForTimeout(2000);
      steps.push(await pageReport(page, "Shop via nav link"));
    }

    // Sign in page from unauthenticated action
    await page.goto(`${BASE}/auth/sign-in`, { waitUntil: "networkidle" });
    steps.push(await pageReport(page, "Sign in page"));

    await page.goto(`${BASE}/auth/create-account`, { waitUntil: "networkidle" });
    steps.push(await pageReport(page, "Create account — choose role"));

    await page.goto(`${BASE}/how-it-works`, { waitUntil: "networkidle" });
    steps.push(await pageReport(page, "How it works"));

    writeFileSync(
      "/Users/kingsley/Projects/RLSTD_V1/RELISTED-frontend1/docs/journey-audit-output.json",
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
