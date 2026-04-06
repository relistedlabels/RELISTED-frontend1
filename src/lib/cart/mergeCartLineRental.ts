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

export function isActivePendingCartRental(
  status?: string,
  expiresAt?: string,
): boolean {
  const u = (status ?? "").trim().toUpperCase();
  if (
    u === "EXPIRED" ||
    u === "REJECTED" ||
    u === "DECLINED" ||
    u === "CANCELLED" ||
    u === "ACCEPTED" ||
    u === "APPROVED" ||
    u === "COMPLETED"
  ) {
    return false;
  }
  const raw = (status ?? "").trim();
  const isPending =
    u === "PENDING" ||
    u === "PENDING_LISTER_APPROVAL" ||
    raw === "pending_lister_approval";
  if (!isPending) return false;
  const ex = expiresAt?.trim();
  if (ex) {
    return new Date(ex).getTime() > Date.now();
  }
  return true;
}

export function isCartRentalMainListRow(
  status?: string,
  expiresAt?: string,
): boolean {
  const u = (status ?? "").trim().toUpperCase();
  if (
    u === "EXPIRED" ||
    u === "REJECTED" ||
    u === "DECLINED" ||
    u === "CANCELLED" ||
    u === "COMPLETED"
  ) {
    return false;
  }
  if (u === "APPROVED" || u === "ACCEPTED") {
    return true;
  }
  return isActivePendingCartRental(status, expiresAt);
}

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

  const rawList = item.rentalRequests ?? item.rental_requests;
  if (Array.isArray(rawList) && rawList[0] && typeof rawList[0] === "object") {
    const r0 = rawList[0] as Record<string, unknown>;
    const rid = pickStr(r0, ["requestId", "request_id", "id"]);
    if (rid) {
      return {
        rentalRequestId: rid,
        expiresAt: pickStr(r0, ["expiresAt", "expires_at"]),
        status: pickStr(r0, ["status", "rentalStatus", "rental_status"]),
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

function lineMetaFromRental(r: RentalRequest): LineRentalMeta {
  return {
    rentalRequestId: r.requestId,
    status: r.status,
    ...(r.expiresAt ? { expiresAt: r.expiresAt } : {}),
  };
}

function rentalMetaIndexByRequestId(
  rentals: RentalRequest[],
): Map<string, LineRentalMeta> {
  const map = new Map<string, LineRentalMeta>();
  for (const r of rentals) {
    const rid = trimId(r.requestId);
    if (!rid) continue;
    map.set(rid, lineMetaFromRental(r));
  }
  return map;
}

export function resolveRentalMetaForCartLine(
  cartLineId: string,
  productId: string,
  embedded: LineRentalMeta | null,
  rentals: RentalRequest[],
): LineRentalMeta | null {
  const byRid = rentalMetaIndexByRequestId(rentals);
  const embeddedRid = trimId(embedded?.rentalRequestId);
  if (embeddedRid) {
    const fromList = byRid.get(embeddedRid);
    if (fromList) {
      return embedded ? { ...embedded, ...fromList } : fromList;
    }
  }

  const cid = trimId(cartLineId);
  const pid = trimId(productId);
  const found = rentals.find((r) => {
    const c = trimId(
      r.cartItemId ?? (r as { cart_item_id?: string }).cart_item_id,
    );
    if (c !== cid) return false;
    if (pid && trimId(r.productId) !== pid) return false;
    return true;
  });

  const fromList = found ? lineMetaFromRental(found) : null;

  if (fromList && embedded) {
    return { ...embedded, ...fromList };
  }
  return fromList ?? embedded;
}
