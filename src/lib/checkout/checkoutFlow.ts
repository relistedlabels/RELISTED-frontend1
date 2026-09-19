import type { CartItem } from "@/lib/api/cart";
import {
  isCartPurchaseResaleOnly,
  isCheckoutRentalLine,
  isCheckoutResalePurchaseLine,
} from "@/lib/cart/checkoutLineKind";

type CheckoutLineRef = {
  cartItemId?: string;
  cart_item_id?: string;
  rentalDays?: number;
  isResale?: boolean;
  listerId?: string;
  productDetail?: { listingType?: string; curatorId?: string } | null;
  product?: { listingType?: string; curatorId?: string } | null;
};

export type CheckoutDispatchPreviewRow = {
  title: string;
  range: string;
};

export type CheckoutDispatchPreviewGroup = {
  bucketIndex?: number;
  groupHeading: string | null;
  listerLocation?: string;
  rows: CheckoutDispatchPreviewRow[];
};

export type CheckoutReviewLeg = {
  id: "delivery" | "return";
  title: string;
  address: string;
  windows: string[];
  shipping: Array<{ method: string; cost?: number }>;
};

export type CheckoutFlowFlags = {
  approvedLineCount: number;
  rentalLineCount: number;
  purchaseLineCount: number;
  hasReturnShippingLeg: boolean;
  isCartPurchaseResaleOnly: boolean;
  multiListerRentalCart: boolean;
  /** Return pickup + review card visibility (approved checkout includes rentals). */
  shouldShowReturnUi: boolean;
  listerIds: string[];
};

type ShippingTierPick = {
  name: string;
  totalShippingCost: number;
};

type ShippingBucketPick = {
  bucketIndex: number;
  shippingTiers: ShippingTierPick[];
};

export type BuildCheckoutReviewLegsInput = {
  deliveryAddressLine: string;
  returnPickupAddressLine: string;
  isCartPurchaseResaleOnly: boolean;
  showReturnShippingTierPicker: boolean;
  summaryDispatchPreview?: CheckoutDispatchPreviewGroup[];
  usePerBucketOutbound: boolean;
  outboundBuckets: ShippingBucketPick[];
  selectedOutboundTierByBucket: Record<number, string>;
  selectedShippingTier: string;
  tierList: ShippingTierPick[];
  usePerBucketReturn: boolean;
  returnBuckets: ShippingBucketPick[];
  selectedReturnTierByBucket: Record<number, string>;
  selectedReturnShippingTier: string;
  returnTierList: ShippingTierPick[];
};

function listerIdFromLine(line: CheckoutLineRef): string | undefined {
  const id = line.listerId ?? line.productDetail?.curatorId ?? line.product?.curatorId;
  return typeof id === "string" && id.trim() ? id.trim() : undefined;
}

export function analyzeCheckoutFlow(
  approvedLines: CheckoutLineRef[],
  cartItems: CartItem[] | undefined,
): CheckoutFlowFlags {
  const rentalLines = approvedLines.filter((line) =>
    isCheckoutRentalLine(line, cartItems),
  );
  const purchaseLines = approvedLines.filter((line) =>
    isCheckoutResalePurchaseLine(line, cartItems),
  );
  const rentalListerIds = new Set(
    rentalLines.map(listerIdFromLine).filter(Boolean) as string[],
  );
  const cartIsPurchaseResaleOnly = isCartPurchaseResaleOnly(cartItems);

  return {
    approvedLineCount: approvedLines.length,
    rentalLineCount: rentalLines.length,
    purchaseLineCount: purchaseLines.length,
    hasReturnShippingLeg: rentalLines.length > 0,
    isCartPurchaseResaleOnly: cartIsPurchaseResaleOnly,
    multiListerRentalCart: rentalListerIds.size > 1,
    shouldShowReturnUi: rentalLines.length > 0,
    listerIds: [
      ...new Set(
        approvedLines.map(listerIdFromLine).filter(Boolean) as string[],
      ),
    ],
  };
}

function collectDispatchWindows(
  summaryDispatchPreview: CheckoutDispatchPreviewGroup[] | undefined,
): { deliveryWindows: string[]; returnWindows: string[] } {
  const deliveryWindows: string[] = [];
  const returnWindows: string[] = [];

  for (const group of summaryDispatchPreview ?? []) {
    for (const row of group.rows) {
      if (row.title.toLowerCase().includes("return pickup")) {
        returnWindows.push(row.range);
      } else {
        deliveryWindows.push(row.range);
      }
    }
  }

  return { deliveryWindows, returnWindows };
}

function selectedTierRows(
  buckets: ShippingBucketPick[],
  selectedByBucket: Record<number, string>,
): Array<{ method: string; cost?: number }> {
  return buckets.flatMap((bucket) => {
    const pick =
      selectedByBucket[bucket.bucketIndex] ??
      bucket.shippingTiers[0]?.name ??
      "";
    const row = bucket.shippingTiers.find((tier) => tier.name === pick);
    if (!pick) return [];
    return [{ method: pick, cost: row?.totalShippingCost }];
  });
}

function selectedSingleTierRow(
  tierList: ShippingTierPick[],
  selectedName: string,
): Array<{ method: string; cost?: number }> {
  const pick = selectedName || tierList[0]?.name || "";
  const row = tierList.find((tier) => tier.name === pick);
  if (!pick) return [];
  return [{ method: pick, cost: row?.totalShippingCost }];
}

export function buildCheckoutReviewLegs(
  input: BuildCheckoutReviewLegsInput,
): CheckoutReviewLeg[] {
  const { deliveryWindows, returnWindows } = collectDispatchWindows(
    input.summaryDispatchPreview,
  );

  const deliveryShipping = input.usePerBucketOutbound
    ? selectedTierRows(
        input.outboundBuckets,
        input.selectedOutboundTierByBucket,
      )
    : selectedSingleTierRow(input.tierList, input.selectedShippingTier);

  const returnShipping = input.showReturnShippingTierPicker
    ? input.usePerBucketReturn
      ? selectedTierRows(input.returnBuckets, input.selectedReturnTierByBucket)
      : selectedSingleTierRow(
          input.returnTierList,
          input.selectedReturnShippingTier,
        )
    : [];

  const legs: CheckoutReviewLeg[] = [
    {
      id: "delivery",
      title: "Delivery to you",
      address: input.deliveryAddressLine,
      windows: deliveryWindows,
      shipping: deliveryShipping,
    },
  ];

  if (!input.isCartPurchaseResaleOnly) {
    legs.push({
      id: "return",
      title: "Return from you",
      address: input.returnPickupAddressLine,
      windows: returnWindows,
      shipping: returnShipping,
    });
  }

  return legs;
}
