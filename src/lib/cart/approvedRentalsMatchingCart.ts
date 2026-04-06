import type { CartItem } from "@/lib/api/cart";
import { isLineRentalApproved } from "@/lib/cart/rentalRequestUi";

export function approvedRentalsMatchingCurrentCart<
  T extends {
    productId: string;
    status?: string;
    cartItemId?: string;
    cart_item_id?: string;
  },
>(approvedRows: T[], cartItems: CartItem[] | undefined): T[] {
  const items = cartItems ?? [];
  if (items.length === 0) return [];

  const cartProductIds = new Set(items.map((i) => i.productId));
  const cartLineIds = new Set(items.map((i) => String(i.id).trim()));

  return approvedRows.filter((item) => {
    const st = item.status?.trim();
    if (st && !isLineRentalApproved(item.status)) return false;
    if (!cartProductIds.has(item.productId)) return false;
    const lineId = String(
      item.cartItemId ?? item.cart_item_id ?? "",
    ).trim();
    if (!lineId) return false;
    return cartLineIds.has(lineId);
  });
}
