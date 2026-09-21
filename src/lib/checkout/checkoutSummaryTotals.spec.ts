import { describe, expect, test } from "bun:test";
import {
  buildCheckoutStickySummaryLines,
  computeCheckoutGrandTotal,
  computeDisplayOutboundShipping,
  computeDisplayReturnShipping,
  computeListerSubtotal,
} from "./checkoutSummaryTotals";

describe("computeDisplayOutboundShipping", () => {
  test("uses selected tier total when not per-bucket", () => {
    expect(
      computeDisplayOutboundShipping({
        usePerBucket: false,
        outboundShippingByBucket: [],
        selectedOutboundTierByBucket: {},
        shipmentBucketsMeta: [],
        selectedTierTotal: 4500,
        summaryOutboundTotal: 5000,
      }),
    ).toBe(4500);
  });

  test("sums per-bucket tier picks with fallback to shipment meta", () => {
    expect(
      computeDisplayOutboundShipping({
        usePerBucket: true,
        outboundShippingByBucket: [
          {
            bucketIndex: 0,
            shippingTiers: [
              { name: "Budget", totalShippingCost: 3000 },
              { name: "Express", totalShippingCost: 5000 },
            ],
          },
          {
            bucketIndex: 1,
            shippingTiers: [{ name: "Budget", totalShippingCost: 2500 }],
          },
        ],
        selectedOutboundTierByBucket: { 0: "Express" },
        shipmentBucketsMeta: [{ bucketIndex: 1, outboundShippingCost: 2600 }],
      }),
    ).toBe(7500);
  });
});

describe("computeDisplayReturnShipping", () => {
  test("returns zero leg total when cart has no rental return shipping", () => {
    expect(
      computeDisplayReturnShipping({
        hasReturnShippingLeg: false,
        usePerBucketReturn: false,
        returnShippingByBucket: [],
        selectedReturnTierByBucket: {},
        shipmentBucketsMeta: [],
        summaryReturnTotal: 5000,
      }),
    ).toBe(0);
  });

  test("sums per-bucket return tiers when enabled", () => {
    expect(
      computeDisplayReturnShipping({
        hasReturnShippingLeg: true,
        usePerBucketReturn: true,
        returnShippingByBucket: [
          {
            bucketIndex: 0,
            shippingTiers: [{ name: "Standard", totalShippingCost: 4200 }],
          },
        ],
        selectedReturnTierByBucket: {},
        shipmentBucketsMeta: [],
      }),
    ).toBe(4200);
  });
});

describe("computeCheckoutGrandTotal", () => {
  test("aggregates merchandise, shipping, fees", () => {
    const total = computeCheckoutGrandTotal(
      {
        rentalTotal: 30000,
        collateralTotal: 50000,
        cleaningTotal: 4000,
        serviceCharge: 3000,
        vatAmount: 2250,
      },
      5000,
      5000,
    );
    expect(total).toBe(99250);
  });
});

describe("buildCheckoutStickySummaryLines", () => {
  test("builds rental and fee rows for mixed checkout", () => {
    expect(
      buildCheckoutStickySummaryLines({
        summary: {
          rentalTotal: 30000,
          collateralTotal: 50000,
          cleaningTotal: 4000,
          serviceCharge: 3000,
          vatAmount: 2250,
        },
        displayOutboundShipping: 5000,
        displayReturnShipping: 4200,
        hasReturnShippingLeg: true,
      }),
    ).toEqual([
      { label: "Rental", amount: 30000 },
      { label: "Security deposit", amount: 50000 },
      { label: "Cleaning", amount: 4000 },
      { label: "Delivery", amount: 5000 },
      { label: "Return pickup", amount: 4200 },
      { label: "Service charge", amount: 3000 },
      { label: "VAT", amount: 2250 },
    ]);
  });
});

describe("computeListerSubtotal", () => {
  test("includes rental collateral and cleaning but not purchase-only extras", () => {
    expect(
      computeListerSubtotal({
        purchaseTotal: 0,
        rentalTotal: 30000,
        collateralTotal: 50000,
        cleaningTotal: 4000,
        outboundShippingCost: 5000,
        returnShippingCost: 5000,
      }),
    ).toBe(94000);
  });

  test("includes purchase amount for resale-only lister bucket", () => {
    expect(
      computeListerSubtotal({
        purchaseTotal: 80000,
        rentalTotal: 0,
        outboundShippingCost: 3000,
        returnShippingCost: 0,
      }),
    ).toBe(83000);
  });
});
