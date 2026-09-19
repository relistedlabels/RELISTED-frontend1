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
  productIds?: string[];
  rows: CheckoutDispatchPreviewRow[];
};

export type CheckoutReviewDeliveryShipment = {
  bucketIndex?: number;
  /** Shown when multiple shipments need a sub-label (e.g. From Ada). */
  heading: string | null;
  items: Array<Record<string, unknown>>;
  deliveryWindow?: string;
  pickupWindow?: string;
  shipping?: { method: string; cost?: number };
};

export type CheckoutReviewDelivery = {
  address: string;
  shipments: CheckoutReviewDeliveryShipment[];
};

export type CheckoutReviewReturn = {
  address: string;
  shipments: CheckoutReviewDeliveryShipment[];
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

export type BuildCheckoutReviewDeliveryInput = {
  deliveryAddressLine: string;
  listerGroups: Array<{ listerId: string; items: Array<Record<string, unknown>> }>;
  summaryDispatchPreview?: CheckoutDispatchPreviewGroup[];
  usePerBucketOutbound: boolean;
  outboundBuckets: ShippingBucketPick[];
  selectedOutboundTierByBucket: Record<number, string>;
  selectedShippingTier: string;
  tierList: ShippingTierPick[];
};

export type BuildCheckoutReviewReturnInput = {
  returnPickupAddressLine: string;
  listerGroups: Array<{ listerId: string; items: Array<Record<string, unknown>> }>;
  summaryDispatchPreview?: CheckoutDispatchPreviewGroup[];
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

function isReturnPickupDispatchRow(title: string): boolean {
  return title.toLowerCase().includes("return pickup");
}

function deliveryWindowFromPreviewGroup(
  group: CheckoutDispatchPreviewGroup,
): string | undefined {
  return group.rows.find((row) => !isReturnPickupDispatchRow(row.title))?.range;
}

function returnWindowFromPreviewGroup(
  group: CheckoutDispatchPreviewGroup,
): string | undefined {
  return group.rows.find((row) => isReturnPickupDispatchRow(row.title))?.range;
}

function isRentalCheckoutItem(item: Record<string, unknown>): boolean {
  if (item.isResale === true) return false;
  const rentalDays =
    typeof item.rentalDays === "number"
      ? item.rentalDays
      : typeof item.days === "number"
        ? item.days
        : 0;
  return rentalDays > 0;
}

function rentalItemsFromGroups(
  listerGroups: Array<{ items: Array<Record<string, unknown>> }>,
): Array<Record<string, unknown>> {
  return listerGroups.flatMap((group) => group.items).filter(isRentalCheckoutItem);
}

function checkoutRentalItemsForProductIds(
  listerGroups: Array<{ items: Array<Record<string, unknown>> }>,
  productIds?: string[],
): Array<Record<string, unknown>> {
  const rentalItems = rentalItemsFromGroups(listerGroups);
  if (!productIds?.length) return rentalItems;

  const idSet = new Set(
    productIds.map((id) => id.trim()).filter(Boolean),
  );
  const matched = rentalItems.filter((item) =>
    idSet.has(String(item.productId ?? "").trim()),
  );
  return matched.length > 0 ? matched : rentalItems;
}

function listerNameFromGroupHeading(groupHeading: string | null | undefined): string | null {
  const heading = groupHeading?.trim();
  if (!heading) return null;
  const match = /^Order from (.+?)(?:\s·|$)/i.exec(heading);
  return match?.[1]?.trim() || null;
}

export function checkoutItemsForProductIds(
  listerGroups: Array<{ items: Array<Record<string, unknown>> }>,
  productIds?: string[],
): Array<Record<string, unknown>> {
  const allItems = listerGroups.flatMap((group) => group.items);
  if (!productIds?.length) return allItems;

  const idSet = new Set(
    productIds.map((id) => id.trim()).filter(Boolean),
  );
  const matched = allItems.filter((item) =>
    idSet.has(String(item.productId ?? "").trim()),
  );
  return matched.length > 0 ? matched : allItems;
}

function collectDispatchWindows(
  summaryDispatchPreview: CheckoutDispatchPreviewGroup[] | undefined,
): { deliveryWindows: string[]; returnWindows: string[] } {
  const deliveryWindows: string[] = [];
  const returnWindows: string[] = [];

  for (const group of summaryDispatchPreview ?? []) {
    for (const row of group.rows) {
      if (isReturnPickupDispatchRow(row.title)) {
        returnWindows.push(row.range);
      } else {
        deliveryWindows.push(row.range);
      }
    }
  }

  return { deliveryWindows, returnWindows };
}

function shippingForOutboundBucket(
  bucketIndex: number | undefined,
  input: Pick<
    BuildCheckoutReviewDeliveryInput,
    | "usePerBucketOutbound"
    | "outboundBuckets"
    | "selectedOutboundTierByBucket"
    | "selectedShippingTier"
    | "tierList"
  >,
): { method: string; cost?: number } | undefined {
  if (input.usePerBucketOutbound && bucketIndex != null) {
    const bucket = input.outboundBuckets.find(
      (row) => row.bucketIndex === bucketIndex,
    );
    if (!bucket) return undefined;
    const pick =
      input.selectedOutboundTierByBucket[bucketIndex] ??
      bucket.shippingTiers[0]?.name ??
      "";
    const tier = bucket.shippingTiers.find((row) => row.name === pick);
    if (!pick) return undefined;
    return { method: pick, cost: tier?.totalShippingCost };
  }

  const rows = selectedSingleTierRow(input.tierList, input.selectedShippingTier);
  return rows[0];
}

function shippingForReturnBucket(
  bucketIndex: number | undefined,
  input: Pick<
    BuildCheckoutReviewReturnInput,
    | "usePerBucketReturn"
    | "returnBuckets"
    | "selectedReturnTierByBucket"
    | "selectedReturnShippingTier"
    | "returnTierList"
  >,
): { method: string; cost?: number } | undefined {
  if (input.usePerBucketReturn && bucketIndex != null) {
    const bucket = input.returnBuckets.find(
      (row) => row.bucketIndex === bucketIndex,
    );
    if (!bucket) return undefined;
    const pick =
      input.selectedReturnTierByBucket[bucketIndex] ??
      bucket.shippingTiers[0]?.name ??
      "";
    const tier = bucket.shippingTiers.find((row) => row.name === pick);
    if (!pick) return undefined;
    return { method: pick, cost: tier?.totalShippingCost };
  }

  const rows = selectedSingleTierRow(
    input.returnTierList,
    input.selectedReturnShippingTier,
  );
  return rows[0];
}

function applyShipmentSubHeadings(
  shipments: CheckoutReviewDeliveryShipment[],
  preview: CheckoutDispatchPreviewGroup[],
  fallbackHeading: string,
): void {
  const showSubHeadings = shipments.length > 1;
  for (const shipment of shipments) {
    if (!showSubHeadings) continue;
    const listerName =
      listerNameFromGroupHeading(
        preview.find((group) => group.bucketIndex === shipment.bucketIndex)
          ?.groupHeading,
      ) ||
      (typeof shipment.items[0]?.listerName === "string"
        ? shipment.items[0].listerName
        : null);
    shipment.heading = listerName ? `From ${listerName}` : fallbackHeading;
  }
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

export function buildCheckoutReviewDelivery(
  input: BuildCheckoutReviewDeliveryInput,
): CheckoutReviewDelivery {
  const preview = input.summaryDispatchPreview ?? [];
  const allItems = input.listerGroups.flatMap((group) => group.items);

  if (preview.length === 0) {
    const { deliveryWindows } = collectDispatchWindows(preview);
    const shipping = input.usePerBucketOutbound
      ? selectedTierRows(
          input.outboundBuckets,
          input.selectedOutboundTierByBucket,
        )[0]
      : selectedSingleTierRow(input.tierList, input.selectedShippingTier)[0];

    return {
      address: input.deliveryAddressLine,
      shipments: [
        {
          heading: null,
          items: allItems,
          deliveryWindow: deliveryWindows[0],
          shipping,
        },
      ],
    };
  }

  const shipments: CheckoutReviewDeliveryShipment[] = preview.flatMap(
    (group) => {
      const items = checkoutItemsForProductIds(
        input.listerGroups,
        group.productIds,
      );
      const deliveryWindow = deliveryWindowFromPreviewGroup(group);
      const shipping = shippingForOutboundBucket(group.bucketIndex, input);
      if (!deliveryWindow && items.length === 0 && !shipping) return [];

      return [
        {
          bucketIndex: group.bucketIndex,
          heading: null,
          items,
          deliveryWindow,
          shipping,
        },
      ];
    },
  );

  applyShipmentSubHeadings(shipments, preview, "Delivery");

  if (shipments.length === 0) {
    return {
      address: input.deliveryAddressLine,
      shipments: [
        {
          heading: null,
          items: allItems,
          shipping: shippingForOutboundBucket(undefined, input),
        },
      ],
    };
  }

  return {
    address: input.deliveryAddressLine,
    shipments,
  };
}

export function buildCheckoutReviewReturn(
  input: BuildCheckoutReviewReturnInput,
): CheckoutReviewReturn | null {
  const allRentalItems = rentalItemsFromGroups(input.listerGroups);
  if (allRentalItems.length === 0) return null;

  const preview = (input.summaryDispatchPreview ?? []).filter((group) =>
    group.rows.some((row) => isReturnPickupDispatchRow(row.title)),
  );

  if (preview.length === 0) {
    const { returnWindows } = collectDispatchWindows(input.summaryDispatchPreview);
    const shipping = input.usePerBucketReturn
      ? selectedTierRows(
          input.returnBuckets,
          input.selectedReturnTierByBucket,
        )[0]
      : selectedSingleTierRow(
          input.returnTierList,
          input.selectedReturnShippingTier,
        )[0];

    return {
      address: input.returnPickupAddressLine,
      shipments: [
        {
          heading: null,
          items: allRentalItems,
          pickupWindow: returnWindows[0],
          shipping,
        },
      ],
    };
  }

  const shipments: CheckoutReviewDeliveryShipment[] = preview.flatMap(
    (group) => {
      const items = checkoutRentalItemsForProductIds(
        input.listerGroups,
        group.productIds,
      );
      const pickupWindow = returnWindowFromPreviewGroup(group);
      const shipping = shippingForReturnBucket(group.bucketIndex, input);
      if (!pickupWindow && items.length === 0 && !shipping) return [];

      return [
        {
          bucketIndex: group.bucketIndex,
          heading: null,
          items,
          pickupWindow,
          shipping,
        },
      ];
    },
  );

  applyShipmentSubHeadings(shipments, preview, "Return pickup");

  if (shipments.length === 0) {
    return {
      address: input.returnPickupAddressLine,
      shipments: [
        {
          heading: null,
          items: allRentalItems,
          shipping: shippingForReturnBucket(undefined, input),
        },
      ],
    };
  }

  return {
    address: input.returnPickupAddressLine,
    shipments,
  };
}

export function buildCheckoutReviewLegs(
  input: BuildCheckoutReviewLegsInput,
): CheckoutReviewLeg[] {
  const { deliveryWindows } = collectDispatchWindows(
    input.summaryDispatchPreview,
  );

  const deliveryShipping = input.usePerBucketOutbound
    ? selectedTierRows(
        input.outboundBuckets,
        input.selectedOutboundTierByBucket,
      )
    : selectedSingleTierRow(input.tierList, input.selectedShippingTier);

  return [
    {
      id: "delivery",
      title: "Delivery to you",
      address: input.deliveryAddressLine,
      windows: deliveryWindows,
      shipping: deliveryShipping,
    },
  ];
}
