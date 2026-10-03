/** Pure totals helpers shared by checkout summary UI (FinalOrderSummaryCard). */

export type OrderSummaryTotalsInput = {
  purchaseTotal?: number;
  rentalTotal?: number;
  collateralTotal?: number;
  cleaningTotal?: number;
  serviceCharge?: number;
  vatAmount?: number;
};

export type ShippingBucketTier = {
  bucketIndex: number;
  shippingTiers: Array<{ name: string; totalShippingCost: number }>;
};

export type ShipmentBucketMeta = {
  bucketIndex?: number;
  outboundShippingCost?: number;
  returnShippingCost?: number;
};

function sumPerBucketShipping(
  buckets: ShippingBucketTier[],
  selectedByBucket: Record<number, string>,
  fallbackBuckets: ShipmentBucketMeta[],
  leg: "outbound" | "return",
): number {
  return buckets.reduce((sum, bucket) => {
    const pick =
      selectedByBucket[bucket.bucketIndex] ??
      bucket.shippingTiers[0]?.name ??
      "";
    const row = bucket.shippingTiers.find((tier) => tier.name === pick);
    if (row) return sum + row.totalShippingCost;
    const fallback = fallbackBuckets.find(
      (meta) => meta.bucketIndex === bucket.bucketIndex,
    );
    const cost =
      leg === "outbound"
        ? (fallback?.outboundShippingCost ?? 0)
        : (fallback?.returnShippingCost ?? 0);
    return sum + cost;
  }, 0);
}

export function computeDisplayOutboundShipping(args: {
  usePerBucket: boolean;
  outboundShippingByBucket: ShippingBucketTier[];
  selectedOutboundTierByBucket: Record<number, string>;
  shipmentBucketsMeta: ShipmentBucketMeta[];
  selectedTierTotal?: number;
  summaryOutboundTotal?: number;
}): number {
  if (!args.usePerBucket) {
    return args.selectedTierTotal ?? args.summaryOutboundTotal ?? 0;
  }
  return sumPerBucketShipping(
    args.outboundShippingByBucket,
    args.selectedOutboundTierByBucket,
    args.shipmentBucketsMeta,
    "outbound",
  );
}

export function computeDisplayReturnShipping(args: {
  hasReturnShippingLeg: boolean;
  usePerBucketReturn: boolean;
  returnShippingByBucket: ShippingBucketTier[];
  selectedReturnTierByBucket: Record<number, string>;
  shipmentBucketsMeta: ShipmentBucketMeta[];
  selectedReturnTierTotal?: number;
  summaryReturnTotal?: number;
}): number {
  if (!args.hasReturnShippingLeg) return 0;
  if (args.usePerBucketReturn) {
    return sumPerBucketShipping(
      args.returnShippingByBucket,
      args.selectedReturnTierByBucket,
      args.shipmentBucketsMeta,
      "return",
    );
  }
  return args.selectedReturnTierTotal ?? args.summaryReturnTotal ?? 0;
}

export function computeCheckoutGrandTotal(
  summary: OrderSummaryTotalsInput,
  displayOutboundShipping: number,
  displayReturnShipping: number,
): number {
  return (
    (summary.purchaseTotal ?? 0) +
    (summary.rentalTotal ?? 0) +
    (summary.collateralTotal ?? 0) +
    (summary.cleaningTotal ?? 0) +
    displayOutboundShipping +
    displayReturnShipping +
    (summary.serviceCharge ?? 0) +
    (summary.vatAmount ?? 0)
  );
}

export type CheckoutStickySummaryLine = {
  label: string;
  amount: number;
};

/** Compact payment breakdown rows for the mobile sticky checkout bar. */
export function buildCheckoutStickySummaryLines(args: {
  summary: OrderSummaryTotalsInput;
  displayOutboundShipping: number;
  displayReturnShipping: number;
  hasReturnShippingLeg: boolean;
}): CheckoutStickySummaryLine[] {
  const { summary, displayOutboundShipping, displayReturnShipping, hasReturnShippingLeg } =
    args;
  const lines: CheckoutStickySummaryLine[] = [];
  const purchaseTotal = summary.purchaseTotal ?? 0;
  const rentalTotal = summary.rentalTotal ?? 0;
  const hasRentalItems = hasReturnShippingLeg && rentalTotal > 0;

  if (purchaseTotal > 0) {
    lines.push({ label: "Purchase", amount: purchaseTotal });
  }
  if (hasRentalItems) {
    lines.push({ label: "Rental", amount: rentalTotal });
    lines.push({
      label: "Security deposit",
      amount: summary.collateralTotal ?? 0,
    });
    lines.push({ label: "Cleaning", amount: summary.cleaningTotal ?? 0 });
  }
  lines.push({ label: "Delivery", amount: displayOutboundShipping });
  if (hasReturnShippingLeg && displayReturnShipping > 0) {
    lines.push({ label: "Return pickup", amount: displayReturnShipping });
  }
  const serviceCharge = summary.serviceCharge ?? 0;
  if (serviceCharge > 0) {
    lines.push({ label: "Service charge", amount: serviceCharge });
  }
  const vatAmount = summary.vatAmount ?? 0;
  if (vatAmount > 0) {
    lines.push({ label: "VAT", amount: vatAmount });
  }
  return lines;
}

export function computeListerSubtotal(breakdown: {
  purchaseTotal?: number;
  rentalTotal?: number;
  collateralTotal?: number;
  cleaningTotal?: number;
  outboundShippingCost?: number;
  returnShippingCost?: number;
}): number {
  const hasResale = (breakdown.purchaseTotal ?? 0) > 0;
  const hasRental = (breakdown.rentalTotal ?? 0) > 0;
  return (
    (hasResale ? (breakdown.purchaseTotal ?? 0) : 0) +
    (hasRental ? (breakdown.rentalTotal ?? 0) : 0) +
    (hasRental ? (breakdown.collateralTotal ?? 0) : 0) +
    (hasRental ? (breakdown.cleaningTotal ?? 0) : 0) +
    (breakdown.outboundShippingCost ?? 0) +
    (breakdown.returnShippingCost ?? 0)
  );
}
