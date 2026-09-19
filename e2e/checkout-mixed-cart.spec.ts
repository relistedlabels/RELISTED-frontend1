import { expect, test } from "./fixtures/test";
import {
  gotoCheckoutStep,
  mockCheckoutScenario,
  seedRenterSession,
  type CheckoutMockConfig,
} from "./helpers/checkoutMock";

const purchaseOnlyScenario: CheckoutMockConfig = {
  cartItems: [
    {
      id: "ci-purchase-1",
      cartId: "cart-e2e",
      productId: "prod-purchase-b",
      days: 0,
      createdAt: new Date().toISOString(),
      product: {
        id: "prod-purchase-b",
        name: "Silk top",
        listingType: "RESALE",
        resalePrice: 45000,
        isActive: true,
        productVerified: true,
        status: "AVAILABLE",
      },
      rentalRequest: {
        requestId: "req-purchase-1",
        status: "ACCEPTED",
        rentalDays: 0,
      },
    },
  ],
  rentalRequests: [
    {
      requestId: "req-purchase-1",
      cartItemId: "ci-purchase-1",
      productId: "prod-purchase-b",
      productName: "Silk top",
      listerId: "lister-b",
      listerName: "Bea",
      rentalDays: 0,
      totalPrice: 45000,
      status: "approved",
      product: { name: "Silk top", listingType: "RESALE" },
    },
  ],
  orderSummary: {
    success: true,
    data: {
      summary: {
        rentalTotal: 0,
        collateralTotal: 0,
        cleaningTotal: 0,
        purchaseTotal: 45000,
        outboundShippingTotal: 3200,
        returnShippingTotal: 0,
        serviceCharge: 1500,
        vatAmount: 1125,
        grandTotal: 50825,
      },
      outboundShippingByBucket: [
        {
          bucketIndex: 1,
          shippingTiers: [
            { name: "shipbubble", totalShippingCost: 3200, grandTotal: 50825 },
          ],
        },
      ],
      listerBreakdowns: [
        {
          listerId: "lister-b",
          listerName: "Bea",
          purchaseTotal: 45000,
          outboundShippingCost: 3200,
          returnShippingCost: 0,
        },
      ],
      shipmentBuckets: [
        {
          bucketIndex: 1,
          listerId: "lister-b",
          listerName: "Bea",
          bucketMode: "RESALE",
          outboundShippingCost: 3200,
          returnShippingCost: 0,
        },
      ],
      dispatchPreview: [
        {
          bucketIndex: 1,
          groupHeading: "Bea",
          rows: [
            {
              title: "Purchase delivery",
              range: "Tue 09:00 to Tue 13:00",
            },
          ],
        },
      ],
    },
  },
};

const mixedMultiListerScenario: CheckoutMockConfig = {
  cartItems: [
    {
      id: "ci-rental-a",
      cartId: "cart-e2e",
      productId: "prod-rental-a",
      days: 3,
      createdAt: new Date().toISOString(),
      product: {
        id: "prod-rental-a",
        name: "Silk dress",
        listingType: "RENTAL",
        dailyPrice: 10000,
        isActive: true,
        productVerified: true,
        status: "AVAILABLE",
      },
      rentalRequest: {
        requestId: "req-rental-a",
        status: "ACCEPTED",
        rentalDays: 3,
      },
    },
    {
      id: "ci-purchase-b",
      cartId: "cart-e2e",
      productId: "prod-purchase-b",
      days: 0,
      createdAt: new Date().toISOString(),
      product: {
        id: "prod-purchase-b",
        name: "Silk top",
        listingType: "RESALE",
        resalePrice: 45000,
        isActive: true,
        productVerified: true,
        status: "AVAILABLE",
      },
      rentalRequest: {
        requestId: "req-purchase-b",
        status: "ACCEPTED",
        rentalDays: 0,
      },
    },
  ],
  rentalRequests: [
    {
      requestId: "req-rental-a",
      cartItemId: "ci-rental-a",
      productId: "prod-rental-a",
      productName: "Silk dress",
      listerId: "lister-a",
      listerName: "Ada",
      rentalDays: 3,
      totalPrice: 30000,
      status: "approved",
      product: { name: "Silk dress", listingType: "RENTAL" },
    },
    {
      requestId: "req-purchase-b",
      cartItemId: "ci-purchase-b",
      productId: "prod-purchase-b",
      productName: "Silk top",
      listerId: "lister-b",
      listerName: "Bea",
      rentalDays: 0,
      totalPrice: 45000,
      status: "approved",
      product: { name: "Silk top", listingType: "RESALE" },
    },
  ],
  orderSummary: {
    success: true,
    data: {
      summary: {
        rentalTotal: 30000,
        collateralTotal: 50000,
        cleaningTotal: 4000,
        purchaseTotal: 45000,
        outboundShippingTotal: 8200,
        returnShippingTotal: 4500,
        serviceCharge: 4500,
        vatAmount: 3375,
        grandTotal: 145075,
      },
      shippingTiers: [
        {
          name: "relisted_dispatch",
          totalShippingCost: 5000,
          grandTotal: 145075,
        },
      ],
      returnShippingTiers: [
        {
          name: "relisted_dispatch",
          totalShippingCost: 4500,
          grandTotal: 145075,
        },
      ],
      outboundShippingByBucket: [
        {
          bucketIndex: 0,
          shippingTiers: [
            {
              name: "relisted_dispatch",
              totalShippingCost: 5000,
              grandTotal: 145075,
            },
          ],
        },
        {
          bucketIndex: 1,
          shippingTiers: [
            { name: "shipbubble", totalShippingCost: 3200, grandTotal: 145075 },
          ],
        },
      ],
      returnShippingByBucket: [
        {
          bucketIndex: 0,
          shippingTiers: [
            {
              name: "relisted_dispatch",
              totalShippingCost: 4500,
              grandTotal: 145075,
            },
          ],
        },
      ],
      listerBreakdowns: [
        {
          listerId: "lister-a",
          listerName: "Ada",
          rentalTotal: 30000,
          collateralTotal: 50000,
          cleaningTotal: 4000,
          outboundShippingCost: 5000,
          returnShippingCost: 4500,
        },
        {
          listerId: "lister-b",
          listerName: "Bea",
          purchaseTotal: 45000,
          outboundShippingCost: 3200,
          returnShippingCost: 0,
        },
      ],
      shipmentBuckets: [
        {
          bucketIndex: 0,
          listerId: "lister-a",
          listerName: "Ada",
          bucketMode: "RENTAL",
          outboundShippingCost: 5000,
          returnShippingCost: 4500,
        },
        {
          bucketIndex: 1,
          listerId: "lister-b",
          listerName: "Bea",
          bucketMode: "RESALE",
          outboundShippingCost: 3200,
          returnShippingCost: 0,
        },
      ],
      dispatchPreview: [
        {
          bucketIndex: 0,
          groupHeading: "Ada",
          rows: [
            { title: "Delivery", range: "Mon 10:00 to Mon 14:00" },
            { title: "Return pickup", range: "Thu 10:00 to Thu 14:00" },
          ],
        },
        {
          bucketIndex: 1,
          groupHeading: "Bea",
          rows: [
            {
              title: "Purchase delivery",
              range: "Tue 09:00 to Tue 13:00",
            },
          ],
        },
      ],
    },
  },
};

test.describe("Checkout mixed carts (mocked API)", () => {
  test("@smoke purchase-only cart hides return UI on review", async ({ page }) => {
    await seedRenterSession(page);
    await mockCheckoutScenario(page, purchaseOnlyScenario);

    await gotoCheckoutStep(page, 4);

    await expect(page.getByText("Review your order")).toBeVisible();
    await expect(page.getByText("Delivery to you")).toBeVisible();
    await expect(page.getByText("Return from you")).toHaveCount(0);
    await expect(page.getByText("shipbubble")).toBeVisible();
  });

  test("@smoke purchase-only cart uses delivery address copy on step 1", async ({
    page,
  }) => {
    await seedRenterSession(page);
    await mockCheckoutScenario(page, purchaseOnlyScenario);

    await gotoCheckoutStep(page, 1);

    await expect(page.getByText("Delivery address")).toBeVisible();
    await expect(page.getByText("Pickup from you")).toHaveCount(0);
  });

  test("@smoke mixed multi-lister cart shows return UI and both delivery windows", async ({
    page,
  }) => {
    await seedRenterSession(page);
    await mockCheckoutScenario(page, mixedMultiListerScenario);

    await gotoCheckoutStep(page, 4);

    await expect(page.getByText("Review your order")).toBeVisible();
    await expect(page.getByText("Delivery to you")).toBeVisible();
    await expect(page.getByText("Return from you")).toBeVisible();
    await expect(page.getByText("relisted_dispatch")).toHaveCount(2);
    await expect(page.getByText("shipbubble")).toBeVisible();
  });

  test("@smoke mixed multi-lister cart shows pickup from you on step 1", async ({
    page,
  }) => {
    await seedRenterSession(page);
    await mockCheckoutScenario(page, mixedMultiListerScenario);

    await gotoCheckoutStep(page, 1);

    await expect(page.getByText("Delivery and return")).toBeVisible();
    await expect(page.getByText("Pickup from you")).toBeVisible();
  });
});
