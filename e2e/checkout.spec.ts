import { expect, test } from "./fixtures/test";
import {
  gotoCheckoutStep,
  mockCheckoutScenario,
  seedRenterSession,
  type CheckoutMockConfig,
} from "./helpers/checkoutMock";

const rentalOnlyScenario: CheckoutMockConfig = {
  cartItems: [
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
  orderSummary: {
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
  },
};

async function gotoCheckoutConfirmStep(page: import("@playwright/test").Page) {
  await gotoCheckoutStep(page, 4);
  await expect(page.getByText("PAYMENT BREAKDOWN")).toBeVisible({
    timeout: 15_000,
  });
}

test.describe("Checkout (mocked API)", () => {
  test("@smoke shows payment breakdown from mocked order summary", async ({
    page,
  }) => {
    await seedRenterSession(page);
    await mockCheckoutScenario(page, rentalOnlyScenario);

    await gotoCheckoutConfirmStep(page);

    await expect(page.getByText("Grand Total:")).toBeVisible();
    await expect(page.getByText("99,250")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Complete Order" }),
    ).toBeVisible();
  });

  test("@smoke shows terms disclaimer above complete order", async ({
    page,
  }) => {
    await seedRenterSession(page);
    await mockCheckoutScenario(page, rentalOnlyScenario);

    await gotoCheckoutConfirmStep(page);

    const completeBtn = page.getByRole("button", { name: "Complete Order" });
    await expect(completeBtn).toBeVisible({ timeout: 15_000 });
    await expect(completeBtn).toBeEnabled();
    await expect(
      page.getByText(/By completing this order, you agree to our/i),
    ).toBeVisible();
  });

  test("@smoke completes checkout with mocked POST and navigates to success", async ({
    page,
  }) => {
    await seedRenterSession(page);
    await mockCheckoutScenario(page, rentalOnlyScenario);

    await page.route("**/*", async (route) => {
      const url = route.request().url();
      if (
        url.includes("/order") &&
        !url.includes("/order/summary") &&
        route.request().method() === "POST"
      ) {
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
        return;
      }
      await route.fallback();
    });

    await gotoCheckoutConfirmStep(page);

    const completeBtn = page.getByRole("button", { name: "Complete Order" });
    await expect(completeBtn).toBeEnabled({ timeout: 5_000 });
    await completeBtn.click();

    await expect(page).toHaveURL(/checkout\/success\?orderId=ORD-E2E-123/, {
      timeout: 15_000,
    });
  });
});
