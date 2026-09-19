import { describe, expect, test } from "bun:test";
import type { CartItem } from "@/lib/api/cart";
import { buildApprovedCheckoutLines } from "@/lib/cart/buildApprovedCheckoutLines";
import {
  analyzeCheckoutFlow,
  buildCheckoutReviewDelivery,
  buildCheckoutReviewLegs,
  checkoutItemsForProductIds,
} from "./checkoutFlow";

const cartPurchaseOnly: CartItem[] = [
  {
    id: "cart-purchase-1",
    days: 0,
    productId: "prod-purchase",
    product: { listingType: "RESALE" },
  } as CartItem,
];

const cartRentalOnly: CartItem[] = [
  {
    id: "cart-rental-1",
    days: 3,
    productId: "prod-rental",
    product: { listingType: "RENTAL" },
  } as CartItem,
];

const cartMixedMultiLister: CartItem[] = [
  {
    id: "cart-rental-a",
    days: 3,
    productId: "prod-rental-a",
    product: { listingType: "RENTAL" },
  } as CartItem,
  {
    id: "cart-rental-b",
    days: 2,
    productId: "prod-rental-b",
    product: { listingType: "RENTAL" },
  } as CartItem,
  {
    id: "cart-purchase-b",
    days: 0,
    productId: "prod-purchase-b",
    product: { listingType: "RESALE" },
  } as CartItem,
];

describe("analyzeCheckoutFlow", () => {
  test("purchase-only cart hides return UI and return shipping leg", () => {
    const approved = buildApprovedCheckoutLines(
      [],
      [
        {
          cartItemId: "cart-purchase-1",
          productId: "prod-purchase",
          isResale: true,
          status: "APPROVED",
          listerId: "lister-b",
        },
      ],
      cartPurchaseOnly,
    );

    const flow = analyzeCheckoutFlow(approved, cartPurchaseOnly);

    expect(flow.approvedLineCount).toBe(1);
    expect(flow.purchaseLineCount).toBe(1);
    expect(flow.rentalLineCount).toBe(0);
    expect(flow.hasReturnShippingLeg).toBe(false);
    expect(flow.isCartPurchaseResaleOnly).toBe(true);
    expect(flow.shouldShowReturnUi).toBe(false);
    expect(flow.multiListerRentalCart).toBe(false);
    expect(flow.listerIds).toEqual(["lister-b"]);
  });

  test("single-lister rental cart shows return UI and return shipping leg", () => {
    const approved = [
      {
        cartItemId: "cart-rental-1",
        productId: "prod-rental",
        rentalDays: 3,
        listerId: "lister-a",
        productDetail: { listingType: "RENTAL" },
      },
    ];

    const flow = analyzeCheckoutFlow(approved, cartRentalOnly);

    expect(flow.rentalLineCount).toBe(1);
    expect(flow.purchaseLineCount).toBe(0);
    expect(flow.hasReturnShippingLeg).toBe(true);
    expect(flow.isCartPurchaseResaleOnly).toBe(false);
    expect(flow.shouldShowReturnUi).toBe(true);
    expect(flow.multiListerRentalCart).toBe(false);
  });

  test("mixed multi-lister cart keeps return UI and flags multi-lister rentals", () => {
    const approved = buildApprovedCheckoutLines(
      [
        {
          cartItemId: "cart-rental-a",
          productId: "prod-rental-a",
          rentalDays: 3,
          status: "approved",
          listerId: "lister-a",
          productDetail: { listingType: "RENTAL" },
        },
        {
          cartItemId: "cart-rental-b",
          productId: "prod-rental-b",
          rentalDays: 2,
          status: "approved",
          listerId: "lister-b",
          productDetail: { listingType: "RENTAL" },
        },
      ],
      [
        {
          cartItemId: "cart-purchase-b",
          productId: "prod-purchase-b",
          isResale: true,
          status: "APPROVED",
          listerId: "lister-b",
        },
      ],
      cartMixedMultiLister,
    );

    const flow = analyzeCheckoutFlow(approved, cartMixedMultiLister);

    expect(flow.approvedLineCount).toBe(3);
    expect(flow.rentalLineCount).toBe(2);
    expect(flow.purchaseLineCount).toBe(1);
    expect(flow.hasReturnShippingLeg).toBe(true);
    expect(flow.isCartPurchaseResaleOnly).toBe(false);
    expect(flow.shouldShowReturnUi).toBe(true);
    expect(flow.multiListerRentalCart).toBe(true);
    expect(flow.listerIds.sort()).toEqual(["lister-a", "lister-b"]);
  });

  test("cart with rental lines hides return UI when only purchase is approved", () => {
    const approved = buildApprovedCheckoutLines(
      [],
      [
        {
          cartItemId: "cart-purchase-b",
          productId: "prod-purchase-b",
          isResale: true,
          status: "APPROVED",
          listerId: "lister-b",
        },
      ],
      cartMixedMultiLister,
    );

    const flow = analyzeCheckoutFlow(approved, cartMixedMultiLister);

    expect(flow.purchaseLineCount).toBe(1);
    expect(flow.rentalLineCount).toBe(0);
    expect(flow.hasReturnShippingLeg).toBe(false);
    expect(flow.isCartPurchaseResaleOnly).toBe(false);
    expect(flow.shouldShowReturnUi).toBe(false);
  });
});

describe("buildCheckoutReviewLegs", () => {
  const baseInput = {
    deliveryAddressLine: "12 Test St, Lagos",
    returnPickupAddressLine: "12 Test St, Lagos",
    showReturnShippingTierPicker: true,
    summaryDispatchPreview: [
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
        rows: [{ title: "Purchase delivery", range: "Tue 09:00 to Tue 13:00" }],
      },
    ],
    usePerBucketOutbound: true,
    outboundBuckets: [
      {
        bucketIndex: 0,
        shippingTiers: [{ name: "relisted_dispatch", totalShippingCost: 5000 }],
      },
      {
        bucketIndex: 1,
        shippingTiers: [{ name: "shipbubble", totalShippingCost: 3200 }],
      },
    ],
    selectedOutboundTierByBucket: {
      0: "relisted_dispatch",
      1: "shipbubble",
    },
    selectedShippingTier: "",
    tierList: [],
    usePerBucketReturn: true,
    returnBuckets: [
      {
        bucketIndex: 0,
        shippingTiers: [{ name: "relisted_dispatch", totalShippingCost: 4500 }],
      },
    ],
    selectedReturnTierByBucket: { 0: "relisted_dispatch" },
    selectedReturnShippingTier: "",
    returnTierList: [],
  };

  test("purchase-only cart renders delivery leg only on review", () => {
    const legs = buildCheckoutReviewLegs({
      ...baseInput,
      isCartPurchaseResaleOnly: true,
      showReturnShippingTierPicker: false,
      summaryDispatchPreview: [
        {
          bucketIndex: 0,
          groupHeading: "Bea",
          rows: [{ title: "Purchase delivery", range: "Tue 09:00 to Tue 13:00" }],
        },
      ],
      outboundBuckets: [baseInput.outboundBuckets[1]],
      selectedOutboundTierByBucket: { 1: "shipbubble" },
      usePerBucketReturn: false,
      returnBuckets: [],
    });

    expect(legs.map((leg) => leg.id)).toEqual(["delivery"]);
    expect(legs[0].windows).toEqual(["Tue 09:00 to Tue 13:00"]);
    expect(legs[0].shipping).toEqual([
      { method: "shipbubble", cost: 3200 },
    ]);
  });

  test("mixed multi-lister cart renders delivery leg with per-bucket outbound shipping", () => {
    const legs = buildCheckoutReviewLegs({
      ...baseInput,
      isCartPurchaseResaleOnly: false,
    });

    expect(legs.map((leg) => leg.id)).toEqual(["delivery"]);
    expect(legs[0].windows).toEqual([
      "Mon 10:00 to Mon 14:00",
      "Tue 09:00 to Tue 13:00",
    ]);
    expect(legs[0].shipping).toEqual([
      { method: "relisted_dispatch", cost: 5000 },
      { method: "shipbubble", cost: 3200 },
    ]);
  });

  test("rental cart review shows delivery leg only", () => {
    const legs = buildCheckoutReviewLegs({
      ...baseInput,
      isCartPurchaseResaleOnly: false,
      showReturnShippingTierPicker: false,
      returnBuckets: [],
      usePerBucketReturn: false,
      returnTierList: [],
    });

    expect(legs.map((leg) => leg.id)).toEqual(["delivery"]);
  });
});

describe("buildCheckoutReviewDelivery", () => {
  const listerGroups = [
    {
      listerId: "lister-a",
      items: [
        {
          productId: "prod-rental",
          productName: "Silk dress",
          listerName: "Ada",
          rentalDays: 7,
        },
      ],
    },
    {
      listerId: "lister-b",
      items: [
        {
          productId: "prod-purchase",
          productName: "Leather bag",
          listerName: "Bea",
          isResale: true,
        },
      ],
    },
  ];

  test("groups delivery windows and carriers per shipment with matched items", () => {
    const review = buildCheckoutReviewDelivery({
      deliveryAddressLine: "12 Test St, Lagos",
      listerGroups,
      summaryDispatchPreview: [
        {
          bucketIndex: 0,
          groupHeading: "Order from Ada · 1 · Silk dress",
          productIds: ["prod-rental"],
          rows: [
            { title: "Rental delivery", range: "Mon 10:00 to Mon 14:00" },
            { title: "Return pickup", range: "Thu 10:00 to Thu 14:00" },
          ],
        },
        {
          bucketIndex: 1,
          groupHeading: "Order from Bea · Leather bag",
          productIds: ["prod-purchase"],
          rows: [
            { title: "Purchase delivery", range: "Tue 09:00 to Tue 13:00" },
          ],
        },
      ],
      usePerBucketOutbound: true,
      outboundBuckets: [
        {
          bucketIndex: 0,
          shippingTiers: [{ name: "relisted_dispatch", totalShippingCost: 5000 }],
        },
        {
          bucketIndex: 1,
          shippingTiers: [{ name: "shipbubble", totalShippingCost: 3200 }],
        },
      ],
      selectedOutboundTierByBucket: {
        0: "relisted_dispatch",
        1: "shipbubble",
      },
      selectedShippingTier: "",
      tierList: [],
    });

    expect(review.shipments).toHaveLength(2);
    expect(review.shipments[0]?.items.map((item) => item.productName)).toEqual([
      "Silk dress",
    ]);
    expect(review.shipments[0]?.deliveryWindow).toBe("Mon 10:00 to Mon 14:00");
    expect(review.shipments[0]?.shipping).toEqual({
      method: "relisted_dispatch",
      cost: 5000,
    });
    expect(review.shipments[1]?.items.map((item) => item.productName)).toEqual([
      "Leather bag",
    ]);
    expect(review.shipments[1]?.heading).toBe("From Bea");
  });

  test("checkoutItemsForProductIds maps bucket product ids to checkout lines", () => {
    const items = checkoutItemsForProductIds(listerGroups, ["prod-purchase"]);
    expect(items).toHaveLength(1);
    expect(items[0]?.productName).toBe("Leather bag");
  });
});
