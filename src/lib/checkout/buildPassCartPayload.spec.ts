import { describe, expect, test } from "bun:test";
import {
  buildPassCartPayload,
  getCheckoutTierBlockingIssue,
} from "./buildPassCartPayload";

describe("buildPassCartPayload", () => {
  test("maps primary tier only for simple checkout", () => {
    expect(buildPassCartPayload({ tierName: "relisted_dispatch" })).toEqual({
      pricingTier: "relisted_dispatch",
    });
  });

  test("includes return tier and per-bucket pricing when provided", () => {
    const payload = buildPassCartPayload({
      tierName: "relisted_dispatch",
      returnTierName: "relisted_dispatch",
      outboundPricingByBucket: [{ bucketIndex: 0, pricingTier: "Express" }],
      returnPricingByBucket: [{ bucketIndex: 0, pricingTier: "Standard" }],
      dispatchWindows: {
        OUTBOUND: {
          start: "2026-05-15T09:00:00.000Z",
          end: "2026-05-15T10:00:00.000Z",
        },
      },
      returnPickupAddress: {
        contactName: "Renter",
        phoneNumber: "+2348000000000",
        street: "12 Test St",
        city: "Lagos",
        state: "Lagos",
      },
    });

    expect(payload.pricingTier).toBe("relisted_dispatch");
    expect(payload.returnPricingTier).toBe("relisted_dispatch");
    expect(payload.outboundPricingByBucket).toHaveLength(1);
    expect(payload.returnPricingByBucket).toHaveLength(1);
    expect(payload.dispatchWindows?.OUTBOUND?.start).toContain("2026-05-15");
  });

  test("omits empty return tier", () => {
    expect(
      buildPassCartPayload({ tierName: "Budget", returnTierName: "" }),
    ).toEqual({ pricingTier: "Budget" });
  });
});

describe("getCheckoutTierBlockingIssue", () => {
  const outboundBuckets = [
    { bucketIndex: 0, shippingTiers: [{ name: "Budget" }] },
  ];

  test("blocks when global outbound tier missing", () => {
    expect(
      getCheckoutTierBlockingIssue({
        usePerBucketOutbound: false,
        outboundBuckets,
        selectedOutboundTierByBucket: {},
        selectedShippingTier: "",
        hasReturnShippingLeg: false,
        usePerBucketReturn: false,
        returnBuckets: [],
        selectedReturnTierByBucket: {},
        selectedReturnShippingTier: "",
      }),
    ).toBe("Please select a shipping method");
  });

  test("blocks when per-bucket outbound tier missing", () => {
    expect(
      getCheckoutTierBlockingIssue({
        usePerBucketOutbound: true,
        outboundBuckets: [{ bucketIndex: 0, shippingTiers: [] }],
        selectedOutboundTierByBucket: {},
        selectedShippingTier: "",
        hasReturnShippingLeg: false,
        usePerBucketReturn: false,
        returnBuckets: [],
        selectedReturnTierByBucket: {},
        selectedReturnShippingTier: "",
      }),
    ).toBe("Please select a delivery shipping method for each order.");
  });

  test("blocks when return tier missing for rental cart", () => {
    expect(
      getCheckoutTierBlockingIssue({
        usePerBucketOutbound: false,
        outboundBuckets,
        selectedOutboundTierByBucket: {},
        selectedShippingTier: "Budget",
        hasReturnShippingLeg: true,
        usePerBucketReturn: false,
        returnBuckets: [],
        selectedReturnTierByBucket: {},
        selectedReturnShippingTier: "",
      }),
    ).toBe("Please select a return shipping method");
  });

  test("returns null when all tiers selected", () => {
    expect(
      getCheckoutTierBlockingIssue({
        usePerBucketOutbound: true,
        outboundBuckets,
        selectedOutboundTierByBucket: { 0: "Budget" },
        selectedShippingTier: "",
        hasReturnShippingLeg: true,
        usePerBucketReturn: true,
        returnBuckets: [{ bucketIndex: 0, shippingTiers: [{ name: "Standard" }] }],
        selectedReturnTierByBucket: { 0: "Standard" },
        selectedReturnShippingTier: "",
      }),
    ).toBeNull();
  });
});
