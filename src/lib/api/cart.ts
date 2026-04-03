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

export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  days: number;
  createdAt: string;
  product: CartProduct;
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
 * Remove a cart line (DELETE /cart-items/:id). Cancels the linked rental request server-side.
 */
export const removeCartItem = (id: string) =>
  apiFetch<{ success: boolean; message?: string }>(`/cart-items/${id}`, {
    method: "DELETE",
  });

/**
 * Create an order from cart (POST /order, no body)
 */
export const createOrderApi = () =>
  apiFetch<{
    success: boolean;
    data?: { orderId: string; [key: string]: any };
    message?: string;
  }>("/order", {
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

/**
 * Pass cart with selected shipping tier (POST /order/checkout)
 * @param shippingTierName - The selected shipping tier name (e.g., "Express", "Dellyman")
 */
export const passCartApi = (shippingTierName: string) =>
  apiFetch<{
    success: boolean;
    data?: any;
    message?: string;
  }>("/order", {
    method: "POST",
    body: JSON.stringify({ pricingTier: shippingTierName }),
  });
