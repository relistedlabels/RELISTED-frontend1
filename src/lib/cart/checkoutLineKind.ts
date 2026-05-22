import type { CartItem } from "@/lib/api/cart";

type CheckoutLineRef = {
  cartItemId?: string;
  cart_item_id?: string;
  rentalDays?: number;
  isResale?: boolean;
  productDetail?: { listingType?: string } | null;
  product?: { listingType?: string } | null;
};

/** Cart line for an approved checkout row (request or resale-enriched cart line). */
export function findCartLineForCheckoutItem(
  item: CheckoutLineRef,
  cartItems: CartItem[] | undefined,
): CartItem | undefined {
  const lineId = String(item.cartItemId ?? item.cart_item_id ?? "").trim();
  if (!lineId || !cartItems?.length) return undefined;
  return cartItems.find((c) => c.id === lineId);
}

/** Prefer cart `days` so checkout matches GET /order/summary and POST checkout. */
export function checkoutLineCartDays(
  item: Pick<CheckoutLineRef, "rentalDays">,
  cartLine: CartItem | undefined,
): number {
  if (cartLine != null && typeof cartLine.days === "number") {
    return cartLine.days;
  }
  return item.rentalDays ?? 0;
}

export function checkoutLineListingType(
  item: CheckoutLineRef,
  cartLine: CartItem | undefined,
): string {
  const fromCart = cartLine?.product?.listingType;
  if (typeof fromCart === "string" && fromCart.trim() !== "") {
    return fromCart.trim();
  }
  const detail = item.productDetail?.listingType;
  if (typeof detail === "string" && detail.trim() !== "") {
    return detail.trim();
  }
  const embedded = item.product?.listingType;
  if (typeof embedded === "string" && embedded.trim() !== "") {
    return embedded.trim();
  }
  return "";
}

/**
 * Resale / purchase line (order.service `isResalePurchase`).
 * Cart `days === 0` wins over stale availability-request `rentalDays`.
 */
export function isCheckoutResalePurchaseLine(
  item: CheckoutLineRef,
  cartItems: CartItem[] | undefined,
): boolean {
  if (item.isResale === true) return true;
  const cartLine = findCartLineForCheckoutItem(item, cartItems);
  const days = checkoutLineCartDays(item, cartLine);
  const listingType = checkoutLineListingType(item, cartLine);
  if (listingType === "RESALE") return true;
  if (listingType === "RENT_OR_RESALE" && days === 0) return true;
  return false;
}

/**
 * Rental line that needs outbound + return shipping (order.service rental buckets).
 */
export function isCheckoutRentalLine(
  item: CheckoutLineRef,
  cartItems: CartItem[] | undefined,
): boolean {
  if (isCheckoutResalePurchaseLine(item, cartItems)) return false;
  const cartLine = findCartLineForCheckoutItem(item, cartItems);
  const days = checkoutLineCartDays(item, cartLine);
  const listingType = checkoutLineListingType(item, cartLine);
  return (
    days > 0 &&
    (listingType === "RENTAL" || listingType === "RENT_OR_RESALE")
  );
}
