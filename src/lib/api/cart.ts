import { apiFetch } from "./http";

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

export type OrderPostResponse = {
  success: boolean;
  message?: string;
  data?: {
    ordersCreated?: number;
    totalPaid?: number;
    orderIds?: string[];
    orderId?: string;
    orders?: Array<{ orderId?: string }>;
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
 */
export const getOrderSummaryApi = () =>
  apiFetch<any>("/order/summary", {
    method: "GET",
  });

/** POST /order with `{ pricingTier }` (full checkout). */
export const passCartApi = (shippingTierName: string) =>
  apiFetch<OrderPostResponse>("/order", {
    method: "POST",
    body: JSON.stringify({ pricingTier: shippingTierName }),
  });
