import type { CartItem } from "@/lib/api/cart";
import type { RentalRequest } from "@/lib/api/renters";

export type LineRentalMeta = {
  rentalRequestId?: string;
  expiresAt?: string;
  status?: string;
};

function trimId(v: string | null | undefined): string {
  if (v == null) return "";
  return String(v).trim();
}

function pickStr(
  o: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

/** Rental fields from a cart line (nested rentalRequest or flat ids). */
export function rentalMetaFromCartApiItem(
  item: CartItem & Record<string, unknown>,
): LineRentalMeta | null {
  const nested =
    (item.rentalRequest as Record<string, unknown> | undefined) ??
    (item.rental_request as Record<string, unknown> | undefined);

  if (nested && typeof nested === "object") {
    const rid = pickStr(nested, ["requestId", "request_id", "id"]);
    if (rid) {
      return {
        rentalRequestId: rid,
        expiresAt: pickStr(nested, ["expiresAt", "expires_at"]),
        status: pickStr(nested, ["status", "rentalStatus", "rental_status"]),
      };
    }
  }

  const flatRid = pickStr(item, [
    "rentalRequestId",
    "rental_request_id",
    "requestId",
    "request_id",
  ]);
  if (flatRid) {
    return {
      rentalRequestId: flatRid,
      expiresAt: pickStr(item, ["expiresAt", "expires_at"]),
      status: pickStr(item, [
        "rentalStatus",
        "rental_status",
        "status",
      ]),
    };
  }

  return null;
}

/** Fallback: map rentals by cartItemId === cart line id. */
export function rentalMetaIndexByCartLineId(
  rentals: RentalRequest[],
): Map<string, LineRentalMeta> {
  const map = new Map<string, LineRentalMeta>();
  for (const r of rentals) {
    const cid = trimId(
      r.cartItemId ?? (r as { cart_item_id?: string }).cart_item_id,
    );
    if (!cid) continue;
    map.set(cid, {
      rentalRequestId: r.requestId,
      status: r.status,
      ...(r.expiresAt ? { expiresAt: r.expiresAt } : {}),
    });
  }
  return map;
}
