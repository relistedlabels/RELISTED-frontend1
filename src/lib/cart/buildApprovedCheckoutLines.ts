import type { CartItem } from "@/lib/api/cart";
import { approvedRentalsMatchingCurrentCart } from "@/lib/cart/approvedRentalsMatchingCart";
import {
  isCheckoutRentalLine,
  isCheckoutResalePurchaseLine,
} from "@/lib/cart/checkoutLineKind";
import { isLineRentalApproved } from "@/lib/cart/rentalRequestUi";

type CheckoutLineRef = {
  productId: string;
  cartItemId?: string;
  cart_item_id?: string;
  lineId?: string;
  id?: string;
  status?: string;
};

/**
 * Approved checkout rows for order summary: rental requests plus resale cart lines,
 * without duplicating resale (same cart line as request row and enriched cart line).
 */
export function buildApprovedCheckoutLines<
  TApproved extends CheckoutLineRef,
  TResale extends CheckoutLineRef,
>(
  approvedRowsWithProduct: TApproved[],
  resaleCartLines: TResale[],
  cartItems: CartItem[] | undefined,
): Array<TApproved | TResale> {
  const approvedMatching = approvedRentalsMatchingCurrentCart(
    approvedRowsWithProduct,
    cartItems,
  );

  const approvedCartLineIds = new Set(
    approvedMatching
      .map((item) =>
        String(item.cartItemId ?? item.cart_item_id ?? "").trim(),
      )
      .filter(Boolean),
  );

  const fromRentals = approvedMatching.filter(
    (item) => !isCheckoutResalePurchaseLine(item, cartItems),
  );

  const rentalProductIds = new Set(
    fromRentals
      .filter((item) => isCheckoutRentalLine(item, cartItems))
      .map((item) => item.productId),
  );

  const uniqueResaleItems = resaleCartLines.filter((item) => {
    const lineId = String(
      item.cartItemId ?? item.lineId ?? item.id ?? "",
    ).trim();
    if (!lineId) return false;
    const linkedToApprovedRequest = approvedCartLineIds.has(lineId);
    const preApprovedOnCart = isLineRentalApproved(item.status);
    if (!linkedToApprovedRequest && !preApprovedOnCart) return false;
    if (rentalProductIds.has(item.productId)) return false;
    return true;
  });

  return [...fromRentals, ...uniqueResaleItems];
}
