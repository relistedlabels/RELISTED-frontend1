import type { PassCartPayload, ReturnPickupAddressPayload } from "@/lib/api/cart";
import type { DispatchWindowsPayload } from "@/lib/checkout/dispatchWindows";

export type PassCartMutationInput = {
  tierName: string;
  returnTierName?: string;
  outboundPricingByBucket?: Array<{ bucketIndex: number; pricingTier: string }>;
  returnPricingByBucket?: Array<{ bucketIndex: number; pricingTier: string }>;
  dispatchWindows?: DispatchWindowsPayload;
  returnPickupAddress?: ReturnPickupAddressPayload;
};

/** Maps checkout UI state to POST /order body (shared by usePassCart). */
export function buildPassCartPayload(
  input: PassCartMutationInput,
): PassCartPayload {
  return {
    pricingTier: input.tierName,
    ...(input.returnTierName != null && input.returnTierName !== ""
      ? { returnPricingTier: input.returnTierName }
      : {}),
    ...(input.outboundPricingByBucket != null &&
    input.outboundPricingByBucket.length > 0
      ? { outboundPricingByBucket: input.outboundPricingByBucket }
      : {}),
    ...(input.returnPricingByBucket != null &&
    input.returnPricingByBucket.length > 0
      ? { returnPricingByBucket: input.returnPricingByBucket }
      : {}),
    dispatchWindows: input.dispatchWindows,
    returnPickupAddress: input.returnPickupAddress,
  };
}

type TierBucket = {
  bucketIndex: number;
  shippingTiers: Array<{ name: string }>;
};

/** Returns first blocking issue for shipping tier selection, or null when ready. */
export function getCheckoutTierBlockingIssue(args: {
  usePerBucketOutbound: boolean;
  outboundBuckets: TierBucket[];
  selectedOutboundTierByBucket: Record<number, string>;
  selectedShippingTier: string;
  hasReturnShippingLeg: boolean;
  usePerBucketReturn: boolean;
  returnBuckets: TierBucket[];
  selectedReturnTierByBucket: Record<number, string>;
  selectedReturnShippingTier: string;
}): string | null {
  if (args.usePerBucketOutbound) {
    for (const bucket of args.outboundBuckets) {
      const pick =
        args.selectedOutboundTierByBucket[bucket.bucketIndex]?.trim() ??
        bucket.shippingTiers[0]?.name?.trim() ??
        "";
      if (!pick) {
        return "Please select a delivery shipping method for each order.";
      }
    }
  } else if (!args.selectedShippingTier.trim()) {
    return "Please select a shipping method";
  }

  if (args.hasReturnShippingLeg && args.usePerBucketReturn) {
    for (const bucket of args.returnBuckets) {
      const pick =
        args.selectedReturnTierByBucket[bucket.bucketIndex]?.trim() ??
        bucket.shippingTiers[0]?.name?.trim() ??
        "";
      if (!pick) {
        return "Please select a return shipping method for each rental.";
      }
    }
  } else if (
    args.hasReturnShippingLeg &&
    !args.selectedReturnShippingTier.trim()
  ) {
    return "Please select a return shipping method";
  }

  return null;
}
