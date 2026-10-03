export default async function run(page, ui) {
  const steps = [];
  const snap = async (label) => {
    const url = page.url();
    const full = await ui.snapshot({ full: true });
    const interactive = await ui.snapshot();
    steps.push({ label, url, full, interactive });
    return { full, interactive };
  };

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2000);
  await snap("01-home-landing");

  // Try to find Find Your Next Fit
  let snap1 = steps[steps.length - 1].interactive;
  let fitBtn = snap1.match(/@(e\d+) .*?"Find Your Next Fit"/i)?.[1]
    || snap1.match(/@(e\d+) link "Find Your Next Fit"/i)?.[1]
    || snap1.match(/@(e\d+) button "Find Your Next Fit"/i)?.[1];

  if (fitBtn) {
    await ui.click(fitBtn);
    await page.waitForTimeout(2500);
    await snap("02-after-find-your-next-fit");
  }

  // Navbar shop if visible
  snap2 = steps[steps.length - 1]?.interactive || snap1;
  const shopNav = snap2.match(/@(e\d+) .*?"Shop"/i)?.[1];
  if (shopNav && !page.url().includes("/shop")) {
    await ui.click(shopNav);
    await page.waitForTimeout(2500);
    await snap("03-after-nav-shop");
  }

  // Scroll shop for products
  if (page.url().includes("/shop")) {
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(1500);
    await snap("04-shop-scrolled");
  }

  // Try first product link
  const latest = steps[steps.length - 1].interactive;
  const productLink = latest.match(/@(e\d+) link "[^"]*"/)?.[1];
  const productLinks = [...latest.matchAll(/@(e\d+) link "([^"]+)"/g)]
    .filter((m) => !/shop|sign|cart|home|list|about|how|privacy|terms|contact|closet|sale/i.test(m[2]))
    .slice(0, 5);

  if (productLinks.length) {
    await ui.click(productLinks[0][1]);
    await page.waitForTimeout(3000);
    await snap("05-product-detail");
  }

  // Product page CTAs
  const pSnap = steps[steps.length - 1].interactive;
  const pFull = steps[steps.length - 1].full;

  // Check availability flow (may redirect to sign in)
  const checkAvail = pSnap.match(/@(e\d+) button "Check availability"/i)?.[1]
    || pSnap.match(/@(e\d+) button "Check Availability"/i)?.[1]
    || pSnap.match(/@(e\d+) button "[^"]*availability[^"]*"/i)?.[1];

  if (checkAvail) {
    await ui.click(checkAvail);
    await page.waitForTimeout(2500);
    await snap("06-after-check-availability");
  }

  return {
    steps: steps.map((s) => ({
      label: s.label,
      url: s.url,
      interactive: s.interactive.slice(0, 4000),
      fullExcerpt: s.full.slice(0, 6000),
    })),
    productLinksFound: productLinks.map((m) => m[2]),
    finalUrl: page.url(),
  };
}
