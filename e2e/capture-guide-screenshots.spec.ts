import { test, expect } from "@playwright/test";
import path from "path";

const OUT = path.join(process.cwd(), "docs/guide-screenshots");

test.describe("Guide screenshots", () => {
  test("capture public and lister screens", async ({ page, browser }) => {
    test.setTimeout(120_000);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.screenshot({ path: path.join(OUT, "home-desktop.png"), fullPage: false });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.screenshot({ path: path.join(OUT, "home-mobile.png"), fullPage: false });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/shop?listingType=RENTAL,RENT_OR_RESALE");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT, "shop-desktop.png"), fullPage: false });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/shop?listingType=RENTAL,RENT_OR_RESALE");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT, "shop-mobile.png"), fullPage: false });

    const productsRes = await page.request.get(
      "http://localhost:4000/api/public/products?limit=1",
    );
    const productsJson = await productsRes.json();
    const productId = productsJson?.data?.products?.[0]?.id as string | undefined;
    if (productId) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/shop/product-details/${productId}`);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUT, "product-desktop.png"), fullPage: false });

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/shop/product-details/${productId}`);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(OUT, "product-mobile.png"), fullPage: false });
    }

    await page.goto("/auth/sign-in");
    await page.getByPlaceholder("Enter your email").fill("lister@gmail.com");
    await page.getByPlaceholder("Enter your password").fill("11111111");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/listers|dashboard|onboarding|profile-setup/, { timeout: 15000 }).catch(() => {});

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/listers/dashboard");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT, "lister-dashboard-desktop.png"), fullPage: false });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/listers/dashboard");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT, "lister-dashboard-mobile.png"), fullPage: false });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/listers/orders");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT, "lister-orders-desktop.png"), fullPage: false });

    await page.goto("/listers/inventory");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT, "lister-inventory-desktop.png"), fullPage: false });
  });
});
