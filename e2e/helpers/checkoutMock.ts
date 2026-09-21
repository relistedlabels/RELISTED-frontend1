import type { Page, Route } from "@playwright/test";

const renterSession = {
  token: "e2e-test-token",
  userId: "renter-e2e",
  email: "renter@e2e.test",
  name: "E2E Renter",
  role: "RENTER",
  sessionToken: null,
  requiresMfa: false,
};

export async function seedRenterSession(page: Page) {
  await page.addInitScript((session) => {
    window.localStorage.setItem(
      "user-store",
      JSON.stringify({
        state: session,
        version: 0,
      }),
    );
  }, renterSession);

  await page.context().addCookies([
    {
      name: "token",
      value: renterSession.token,
      domain: "localhost",
      path: "/",
    },
    {
      name: "user_role",
      value: renterSession.role,
      domain: "localhost",
      path: "/",
    },
  ]);
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

export type CheckoutMockConfig = {
  cartItems: Array<Record<string, unknown>>;
  rentalRequests?: Array<Record<string, unknown>>;
  orderSummary: Record<string, unknown>;
};

/** One handler registered last so it wins over the shared e2e network fixture. */
export async function mockCheckoutScenario(
  page: Page,
  config: CheckoutMockConfig,
) {
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes("/auth/user")) {
      if (method === "OPTIONS") {
        await route.fulfill({
          status: 204,
          headers: { "Access-Control-Allow-Origin": "*" },
        });
        return;
      }
      if (method === "GET") {
        await json(route, {
          id: renterSession.userId,
          email: renterSession.email,
          name: renterSession.name,
          role: renterSession.role,
        });
        return;
      }
    }

    if (url.includes("/profile/user-profile") && method === "GET") {
      await json(route, {
        data: {
          id: "profile-e2e",
          userId: renterSession.userId,
          phoneNumber: "+2348000000000",
          address: {
            street: "12 Test St",
            city: "Lagos",
            state: "Lagos",
            country: "Nigeria",
          },
        },
      });
      return;
    }

    if (url.includes("/cart-items")) {
      await json(route, {
        cartId: "cart-e2e",
        items: config.cartItems,
        total: 0,
      });
      return;
    }

    if (url.includes("/api/renters/rental-requests")) {
      await json(route, {
        success: true,
        data: {
          rentalRequests: config.rentalRequests ?? [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
        },
      });
      return;
    }

    if (url.includes("/order/summary")) {
      await json(route, config.orderSummary);
      return;
    }

    if (url.includes("/api/renters/wallet") && method === "GET") {
      await json(route, {
        success: true,
        data: {
          wallet: {
            walletId: "wallet-e2e",
            userId: renterSession.userId,
            balance: {
              availableBalance: 500_000,
              lockedBalance: 0,
              totalBalance: 500_000,
              currency: "NGN",
              lastUpdated: new Date().toISOString(),
            },
            lockedBreakdown: {
              activeRentals: [],
              disputeHolds: [],
              totalLockedAmount: 0,
            },
            statistics: {
              totalDeposits: 500_000,
              totalWithdrawals: 0,
              totalSpent: 0,
            },
          },
        },
      });
      return;
    }

    if (url.includes("/api/public/products/") && method === "GET") {
      const productId = url.split("/").pop()?.split("?")[0] ?? "prod-e2e";
      const listingType = productId.includes("purchase") ? "RESALE" : "RENTAL";
      const productNames: Record<string, string> = {
        "prod-rental-a": "Silk dress",
        "prod-purchase-b": "Silk top",
      };
      await json(route, {
        success: true,
        data: {
          id: productId,
          name: productNames[productId] ?? productId,
          listingType,
          dailyPrice: 10000,
          resalePrice: 45000,
          curatorId: productId.includes("b") ? "lister-b" : "lister-a",
          attachments: { uploads: [] },
        },
      });
      return;
    }

    if (url.includes("/api/public/users/") && method === "GET") {
      const userId =
        url.split("/api/public/users/")[1]?.split("?")[0]?.trim() ?? "lister-a";
      const listerNames: Record<string, string> = {
        "lister-a": "Ada",
        "lister-b": "Bea",
        "lister-e2e": "Ada",
      };
      await json(route, {
        success: true,
        data: {
          user: {
            id: userId,
            name: listerNames[userId] ?? "Lister",
          },
        },
      });
      return;
    }

    if (
      /\/api\/renters\/orders\/[^/?]+$/.test(url) &&
      method === "GET"
    ) {
      const orderId =
        url.split("/api/renters/orders/")[1]?.split("?")[0]?.trim() ??
        "ORD-E2E-123";
      await json(route, {
        success: true,
        data: {
          order: {
            id: orderId,
            orderId,
            status: "confirmed",
            createdAt: new Date().toISOString(),
          },
        },
      });
      return;
    }

    if (
      url.includes("/order") &&
      !url.includes("/order/summary") &&
      method === "POST"
    ) {
      await json(route, {
        success: true,
        data: {
          orderIds: ["ORD-E2E-123"],
          orderId: "ORD-E2E-123",
          shipmentIds: ["ship-1"],
        },
      });
      return;
    }

    await route.fallback();
  });
}

export async function gotoCheckoutStep(page: Page, step: 1 | 2) {
  await page.goto(`/shop/cart/checkout?step=${step}`, {
    waitUntil: "domcontentloaded",
  });
  await page.getByRole("heading", { name: "CHECKOUT" }).waitFor({
    state: "visible",
    timeout: 15_000,
  });
}
