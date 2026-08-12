import { expect, test } from "./fixtures/test";

function seedAuthStorage(page: import("@playwright/test").Page) {
  return page.addInitScript(() => {
    window.localStorage.setItem(
      "user-store",
      JSON.stringify({
        state: {
          token: "e2e-test-token",
          userId: "renter-e2e",
          email: "renter@e2e.test",
          name: "E2E Renter",
          role: "RENTER",
          sessionToken: null,
          requiresMfa: false,
        },
        version: 0,
      }),
    );
  });
}

const orderSummaryBody = {
  success: true,
  data: {
    summary: {
      rentalTotal: 30000,
      collateralTotal: 50000,
      cleaningTotal: 4000,
      purchaseTotal: 0,
      outboundShippingTotal: 5000,
      returnShippingTotal: 5000,
      serviceCharge: 3000,
      vatAmount: 2250,
      grandTotal: 99250,
    },
    shippingTiers: [
      {
        name: "relisted_dispatch",
        totalShippingCost: 5000,
        grandTotal: 99250,
      },
    ],
    returnShippingTiers: [
      {
        name: "relisted_dispatch",
        totalShippingCost: 5000,
        grandTotal: 99250,
      },
    ],
    listerBreakdowns: [
      {
        listerId: "lister-e2e",
        listerName: "Ada",
        rentalTotal: 30000,
        collateralTotal: 50000,
        cleaningTotal: 4000,
        purchaseTotal: 0,
        outboundShippingCost: 5000,
        returnShippingCost: 5000,
      },
    ],
    shipmentBuckets: [
      {
        bucketIndex: 0,
        listerId: "lister-e2e",
        listerName: "Ada",
        bucketMode: "RENTAL",
        outboundShippingCost: 5000,
        returnShippingCost: 5000,
      },
    ],
  },
};

async function mockCheckoutApis(page: import("@playwright/test").Page) {
  await page.route("**/auth/user**", async (route) => {
    if (route.request().method() !== "GET") {
      return route.continue();
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "renter-e2e",
        email: "renter@e2e.test",
        name: "E2E Renter",
        role: "RENTER",
      }),
    });
  });

  await page.route("**/cart-items**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        cartId: "cart-e2e",
        items: [
          {
            id: "ci-e2e-1",
            cartId: "cart-e2e",
            productId: "prod-e2e-1",
            days: 3,
            createdAt: new Date().toISOString(),
            product: {
              id: "prod-e2e-1",
              name: "Silk dress",
              listingType: "RENTAL",
              dailyPrice: 10000,
              isActive: true,
              productVerified: true,
              status: "AVAILABLE",
            },
            rentalRequest: {
              requestId: "req-e2e-1",
              status: "ACCEPTED",
              rentalDays: 3,
            },
          },
        ],
        total: 30000,
      }),
    });
  });

  await page.route("**/api/renters/rental-requests**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          rentalRequests: [
            {
              requestId: "req-e2e-1",
              cartItemId: "ci-e2e-1",
              productId: "prod-e2e-1",
              productName: "Silk dress",
              productImage: "",
              listerId: "lister-e2e",
              listerName: "Ada",
              rentalStartDate: "2026-06-20T08:00:00+01:00",
              rentalEndDate: "2026-06-23T17:00:00+01:00",
              rentalDays: 3,
              rentalPrice: 30000,
              deliveryFee: 0,
              cleaningFee: 4000,
              totalPrice: 30000,
              currency: "NGN",
              autoPay: false,
              status: "approved",
              requestCreatedAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
              timeRemainingSeconds: 86_400,
              timeRemainingMinutes: 1_440,
              product: { name: "Silk dress", listingType: "RENTAL" },
            },
          ],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
      }),
    });
  });

  await page.route("**/profile/user-profile**", async (route) => {
    if (route.request().method() !== "GET") {
      return route.continue();
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          id: "profile-e2e",
          userId: "renter-e2e",
          phoneNumber: "+2348000000000",
          address: {
            street: "12 Test St",
            city: "Lagos",
            state: "Lagos",
            country: "Nigeria",
          },
        },
      }),
    });
  });

  await page.route("**/api/public/products/**", async (route) => {
    if (route.request().method() !== "GET") {
      return route.continue();
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          id: "prod-e2e-1",
          name: "Silk dress",
          listingType: "RENTAL",
          dailyPrice: 10000,
          curatorId: "lister-e2e",
          attachments: { uploads: [] },
        },
      }),
    });
  });

  await page.route("**/api/public/users/**", async (route) => {
    if (route.request().method() !== "GET") {
      return route.continue();
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          id: "lister-e2e",
          name: "Ada",
        },
      }),
    });
  });

  await page.route("**/order/summary**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(orderSummaryBody),
    });
  });
}

test.describe("Checkout (mocked API)", () => {
  test("@smoke shows payment breakdown from mocked order summary", async ({
    page,
  }) => {
    await seedAuthStorage(page);
    await mockCheckoutApis(page);

    await page.goto("/shop/cart/checkout", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: "CHECKOUT" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("PAYMENT BREAKDOWN")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Grand Total:")).toBeVisible();
    await expect(page.getByText("₦99,250", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Complete Order" }),
    ).toBeVisible();
  });

  test("@smoke disables complete order until terms are accepted", async ({
    page,
  }) => {
    await seedAuthStorage(page);
    await mockCheckoutApis(page);

    await page.goto("/shop/cart/checkout", { waitUntil: "domcontentloaded" });

    const completeBtn = page.getByRole("button", { name: "Complete Order" });
    await expect(completeBtn).toBeVisible({ timeout: 15_000 });
    await expect(completeBtn).toBeDisabled();
  });

  test("@smoke completes checkout with mocked POST and navigates to success", async ({
    page,
  }) => {
    await seedAuthStorage(page);
    await mockCheckoutApis(page);

    await page.route("**/order", async (route) => {
      if (route.request().method() !== "POST") {
        return route.continue();
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            orderIds: ["ORD-E2E-123"],
            orderId: "ORD-E2E-123",
            shipmentIds: ["ship-1", "ship-2"],
          },
        }),
      });
    });

    await page.goto("/shop/cart/checkout", { waitUntil: "domcontentloaded" });

    await page.locator('label:has-text("Terms of Service Agreement")').click();
    await page.getByRole("button", { name: "Complete Order" }).click();

    await expect(page).toHaveURL(/checkout\/success\?orderId=ORD-E2E-123/, {
      timeout: 15_000,
    });
  });
});
