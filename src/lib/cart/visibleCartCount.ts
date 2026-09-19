import type { CartItem } from "@/lib/api/cart";
import type { RentalRequest } from "@/lib/api/renters";
import { isLineRentalApproved } from "@/lib/cart/rentalRequestUi";
import {
  rentalMetaFromCartApiItem,
  resolveRentalMetaForCartLine,
} from "@/lib/cart/mergeCartLineRental";

/**
 * Matches the cart page list: resale lines always count; rentals only when approved.
 */
export function countVisibleCartItems(
  items: CartItem[] | undefined,
  rentalRequests: RentalRequest[] = [],
): number {
  if (!items?.length) return 0;

  let count = 0;
  for (const item of items) {
    const fromApi = rentalMetaFromCartApiItem(
      item as CartItem & Record<string, unknown>,
    );
    const merged = resolveRentalMetaForCartLine(
      item.id,
      item.productId,
      fromApi,
      rentalRequests,
    );
    const days = item.days || 0;

    if (!merged) {
      if (days === 0) count++;
      continue;
    }

    if (!isLineRentalApproved(merged.status)) continue;
    count++;
  }

  return count;
}
