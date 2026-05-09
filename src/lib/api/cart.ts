import { apiFetch } from "./http";
import type { DispatchWindowsPayload } from "@/lib/checkout/dispatchWindows";

export type CartProduct = {
  id: string;
  name: string;
  description: string;
  condition: string;
  productVerified: boolean;
  dailyPrice: number;
  isActive: boolean;
  quantity: number;
  status: string;
  color: string;
  measurement: string;
  originalValue: number;
  composition: string;
  [key: string]: any;
};

/** Optional rental snapshot on each cart line. */
export type CartLineRentalSnapshot = {
  requestId: string;
  expiresAt?: string;
  status?: string;
  rentalDays?: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  selectedWindows?: {
    outboundDeliveryWindow?: {
      start: string;
      end: string;
    } | null;
    returnPickupWindow?: {
      start: string;
      end: string;
    } | null;
    resaleWindow?: {
      start: string;
      end: string;
    } | null;
  };
};

export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  days: number;
  createdAt: string;
  product: CartProduct;
  rentalRequest?: CartLineRentalSnapshot;
  rentalRequests?: CartLineRentalSnapshot[];
};

export type CartData = {
  cartId: string;
  items: CartItem[];
  total: number;
};

export type CartResponse = {
  success: boolean;
  data: CartData;
};

/**
 * Get all cart items (GET /cart-items)
 */
export const getCartItemsApi = () =>
  apiFetch<CartData>("/cart-items", {
    method: "GET",
  });

/**
 * Add item to cart (POST /cart-items/item)
 * @param productId - The product ID to add
 * @param days - Number of rental days
 */
export const addCartItemApi = (productId: string, days: number) =>
  apiFetch<{ success: boolean; data?: any; message?: string }>(
    "/cart-items/item",
    {
      method: "POST",
      body: JSON.stringify({ productId, days }),
    },
  );

/**
 * Remove a cart line (DELETE /cart-items/item/:id — matches POST /cart-items/item and PATCH /cart-items/item/:id).
 */
export const removeCartItem = (id: string) =>
  apiFetch<{ success: boolean; message?: string }>(`/cart-items/item/${id}`, {
    method: "DELETE",
  });

/**
 * Reactivate/Re-request availability for a cart item (POST /cart-items/:id/request).
 * If request is EXPIRED, it reactivates it. Otherwise creates new request.
 */
export const reRequestAvailability = (cartItemId: string) =>
  apiFetch<{ success: boolean; message?: string }>(
    `/cart-items/${cartItemId}/request`,
    { method: "POST" },
  );

export type CheckoutShippingTierRow = {
  name: string;
  totalShippingCost: number;
  grandTotal: number;
};

/** Per outbound/resale delivery bucket (same `bucketIndex` as `shipmentBuckets`). */
export type OutboundShippingBucketQuote = {
  bucketIndex: number;
  listerId: string;
  listerName: string;
  bucketMode: string;
  shippingTiers: CheckoutShippingTierRow[];
};

/** Per rental return-leg bucket. */
export type ReturnShippingBucketQuote = {
  bucketIndex: number;
  listerId: string;
  listerName: string;
  shippingTiers: CheckoutShippingTierRow[];
};

/** One shipment pricing leg from GET /order/summary (matches backend `shipmentBuckets`). */
export type CheckoutShipmentBucket = {
  bucketIndex?: number;
  listerId: string;
  listerName: string;
  bucketMode: "RENTAL" | "RESALE" | string;
  productIds?: string[];
  outboundDeliveryWindow?: { start: string; end: string } | null;
  returnPickupWindow?: { start: string; end: string } | null;
  resaleDeliveryWindow?: { start: string; end: string } | null;
  outboundShippingCost?: number;
  returnShippingCost?: number;
  outboundPickupCost?: number;
  returnPickupCost?: number;
};

export type OrderSummaryPayload = {
  summary: {
    rentalTotal?: number;
    collateralTotal?: number;
    cleaningTotal?: number;
    purchaseTotal?: number;
    pickupTotal?: number;
    shippingTotal?: number;
    outboundShippingTotal?: number;
    returnShippingTotal?: number;
    outboundPickupTotal?: number;
    returnPickupTotal?: number;
    returnTotal?: number;
    serviceCharge?: number;
    vatAmount?: number;
    grandTotal?: number;
  };
  shippingTiers: CheckoutShippingTierRow[];
  /** Outbound quotes per shipment bucket (split when multiple listers or schedules). */
  outboundShippingByBucket?: OutboundShippingBucketQuote[];
  /** Return-leg options when the cart includes rental shipments (outbound-only costs per tier name). */
  returnShippingTiers?: CheckoutShippingTierRow[];
  /** Return quotes per rental bucket (split when multiple rental shipments). */
  returnShippingByBucket?: ReturnShippingBucketQuote[];
  listerBreakdowns?: unknown[];
  shipmentBuckets?: CheckoutShipmentBucket[];
};

export type OrderSummaryResponse = {
  success: boolean;
  message?: string;
  data?: OrderSummaryPayload;
};

export type OrderPostResponse = {
  success: boolean;
  message?: string;
  data?: {
    ordersCreated?: number;
    totalPaid?: number;
    orderIds?: string[];
    orderId?: string;
    orders?: Array<{ orderId?: string }>;
    shipmentIds?: string[];
  };
};

export function orderIdsFromOrderPost(
  res: OrderPostResponse | undefined,
): string[] {
  const d = res?.data;
  if (!d) return [];
  const fromList = Array.isArray(d.orderIds)
    ? d.orderIds.filter(
        (id): id is string => typeof id === "string" && id.trim() !== "",
      )
    : [];
  if (fromList.length > 0) return fromList;
  if (typeof d.orderId === "string" && d.orderId.trim() !== "") {
    return [d.orderId.trim()];
  }
  const fromOrders = (d.orders ?? [])
    .map((o) => o?.orderId)
    .filter((id): id is string => typeof id === "string" && id.trim() !== "");
  return fromOrders;
}

export function orderIdFromOrderPost(
  res: OrderPostResponse | undefined,
): string | undefined {
  return orderIdsFromOrderPost(res)[0];
}

/** @deprecated Use `passCartApi` with a pricing tier. */
export const createOrderApi = () =>
  apiFetch<OrderPostResponse>("/order", {
    method: "POST",
    body: JSON.stringify({}),
  });

/**
 * Get order summary (GET /order/summary)
 * @param returnAddress - Optional return pickup address to recalculate shipping
 */
export const getOrderSummaryApi = (returnAddress?: {
  returnStreet?: string;
  returnCity?: string;
  returnState?: string;
  returnCountry?: string;
  returnPostalCode?: string;
  returnLandmark?: string;
  returnInstructions?: string;
}) => {
  const params = new URLSearchParams();
  if (returnAddress?.returnStreet) params.append("returnStreet", returnAddress.returnStreet);
  if (returnAddress?.returnCity) params.append("returnCity", returnAddress.returnCity);
  if (returnAddress?.returnState) params.append("returnState", returnAddress.returnState);
  if (returnAddress?.returnCountry) params.append("returnCountry", returnAddress.returnCountry);
  if (returnAddress?.returnPostalCode) params.append("returnPostalCode", returnAddress.returnPostalCode);
  if (returnAddress?.returnLandmark) params.append("returnLandmark", returnAddress.returnLandmark);
  if (returnAddress?.returnInstructions) params.append("returnInstructions", returnAddress.returnInstructions);
  
  const queryString = params.toString();
  const url = `/order/summary${queryString ? `?${queryString}` : ""}`;
  
  return apiFetch<OrderSummaryResponse>(url, {
    method: "GET",
  });
};

export type OrderSummaryApiResult = Awaited<ReturnType<typeof getOrderSummaryApi>>;

export interface ReturnPickupAddressPayload {
  contactName: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  instructions?: string;
}

/** Stable serialization for comparing pickup payloads (reference-independent). */
export function canonicalReturnPickupJson(
  p: ReturnPickupAddressPayload,
): string {
  return JSON.stringify({
    contactName: p.contactName ?? "",
    phoneNumber: p.phoneNumber ?? "",
    street: p.street ?? "",
    city: p.city ?? "",
    state: p.state ?? "",
    instructions: p.instructions ?? "",
  });
}

export interface PassCartPayload {
  pricingTier: string;
  /** Rental return leg; omit for resale-only or to mirror `pricingTier` on the server default. */
  returnPricingTier?: string;
  outboundPricingByBucket?: Array<{ bucketIndex: number; pricingTier: string }>;
  returnPricingByBucket?: Array<{ bucketIndex: number; pricingTier: string }>;
  dispatchWindows?: DispatchWindowsPayload;
  returnPickupAddress?: ReturnPickupAddressPayload;
}

/** POST /order with `{ pricingTier, dispatchWindows? }` (full checkout). */
export const passCartApi = (payload: PassCartPayload) =>
  apiFetch<OrderPostResponse>("/order", {
    method: "POST",
    body: JSON.stringify(payload),
  });
