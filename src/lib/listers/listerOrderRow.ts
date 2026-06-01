import { normalizeListerOrderStatusKey } from "@/lib/listers/listerOrderStatus";

/** REQ-* order number, approvalRequired, or pending_approval status. */
export function isListerAvailabilityRequestRow(
  order: Record<string, unknown> | null | undefined,
): boolean {
  if (!order) return false;
  const num = String(
    order.orderNumber ?? order.order_number ?? "",
  ).trim();
  if (/^REQ-/i.test(num)) return true;
  if (order.approvalRequired === true) return true;
  const st = normalizeListerOrderStatusKey(String(order.status ?? ""));
  return st === "PENDING_APPROVAL";
}

/** Check if an order is a pure resale order for this lister (scoped items only). */
export function isListerResaleOrder(
  order: Record<string, unknown> | null | undefined,
): boolean {
  if (!order) return false;
  const items = (order.items ?? order.orderItems) as unknown[] | undefined;
  if (items && items.length > 0) {
    return items.every((row) =>
      isRenterResalePurchaseLine(row as Record<string, unknown>),
    );
  }
  const listingType = String(
    order.listingType ?? order.listing_type ?? "",
  ).trim();
  return listingType === "RESALE";
}

/** Check if an order is a mixed order for this lister (rental + resale lines). */
export function isListerMixedOrder(
  order: Record<string, unknown> | null | undefined,
): boolean {
  if (!order) return false;
  return orderHasResalePurchaseLines(order) && orderHasRentalLines(order);
}

/** Check if an order item is a resale item. */
export function isResaleItem(
  item: Record<string, unknown> | null | undefined,
): boolean {
  if (!item) return false;
  const days = Number(item.days ?? item.rentalDays ?? 0);
  return days === 0;
}

/** Renter order line that counts as a resale purchase (matches checkout line semantics). */
export function isRenterResalePurchaseLine(
  item: Record<string, unknown> | null | undefined,
): boolean {
  if (item == null) return false;
  if (!isResaleItem(item)) return false;
  const lt = String(item.listingType ?? "").trim();
  return lt === "RESALE" || lt === "RENT_OR_RESALE";
}

export function orderHasResalePurchaseLines(
  order: Record<string, unknown> | null | undefined,
): boolean {
  if (!order) return false;
  const items = (order.items ?? order.orderItems) as unknown[] | undefined;
  if (!items?.length) return false;
  return items.some((row) =>
    isRenterResalePurchaseLine(row as Record<string, unknown>),
  );
}

/** Order includes at least one rental line (days > 0). */
export function orderHasRentalLines(
  order: Record<string, unknown> | null | undefined,
): boolean {
  if (!order) return false;
  const items = (order.items ?? order.orderItems) as unknown[] | undefined;
  if (!items?.length) return false;
  return items.some((row) => {
    const item = row as Record<string, unknown>;
    const days = Number(item.days ?? item.rentalDays ?? 0);
    if (days <= 0) return false;
    const lt = String(item.listingType ?? "").trim();
    return lt === "RENTAL" || lt === "RENT_OR_RESALE";
  });
}

export function isMixedRenterOrder(
  order: Record<string, unknown> | null | undefined,
): boolean {
  return orderHasResalePurchaseLines(order) && orderHasRentalLines(order);
}

/**
 * At least one resale line: explicit product listing on the line, or any zero-day
 * line on a RESALE / RENT_OR_RESALE order (matches checkout: resale uses days === 0).
 */
export function orderHasAtLeastOneResaleItem(
  order: Record<string, unknown> | null | undefined,
): boolean {
  return orderHasResalePurchaseLines(order);
}

export { shouldShowRenterResaleDeliveryConfirm } from "@/lib/orders/resaleDeliveryConfirm";

/** Check if an order item is a rental item. */
export function isRentalItem(
  item: Record<string, unknown> | null | undefined,
): boolean {
  if (!item) return false;
  const days = Number(item.days ?? item.rentalDays ?? 0);
  return days > 0;
}

function pickAvailabilityOrOrderStatus(order: Record<string, unknown>): string {
  const av = String(
    order.availabilityStatus ?? order.availability_status ?? "",
  ).trim();
  if (av) return av;
  return String(order.status ?? "").trim();
}

/** ACCEPTED / APPROVED availability (hide lister deadline UI). */
export function isListerAvailabilityAcceptedRow(
  order: Record<string, unknown>,
): boolean {
  const k = normalizeListerOrderStatusKey(pickAvailabilityOrOrderStatus(order));
  return k === "ACCEPTED" || k === "APPROVED";
}

export function isListerAvailabilityExpiredStatusRow(
  order: Record<string, unknown>,
): boolean {
  const av = String(
    order.availabilityStatus ?? order.availability_status ?? "",
  ).trim();
  const st = String(order.status ?? "").trim();
  if (av && normalizeListerOrderStatusKey(av) === "EXPIRED") return true;
  if (st && normalizeListerOrderStatusKey(st) === "EXPIRED") return true;
  return false;
}

export function isListerAvailabilityDeadlinePassed(
  expiresAt: string | undefined,
): boolean {
  const s = expiresAt?.trim();
  if (!s) return false;
  const date = new Date(s);
  if (isNaN(date.getTime())) return false;
  return date.getTime() <= Date.now();
}

/** CANCELLED_BY_RENTER (or matching statusLabel). */
export function isListerAvailabilityCancelledByRenterRow(
  order: Record<string, unknown>,
): boolean {
  const av = String(
    order.availabilityStatus ?? order.availability_status ?? "",
  ).trim();
  const st = String(order.status ?? "").trim();
  for (const raw of [av, st]) {
    if (!raw) continue;
    if (normalizeListerOrderStatusKey(raw) === "CANCELLED_BY_RENTER") {
      return true;
    }
  }
  const label = String(order.statusLabel ?? "").trim();
  if (/cancelled\s+by\s+renter/i.test(label)) return true;
  return false;
}

/** Countdown + deadline strips for REQ rows (not accepted, not cancelled-by-renter). */
export function shouldShowListerAvailabilityDeadlineUi(
  order: Record<string, unknown>,
  expiresAt: string | undefined,
  pendingApproval: boolean,
): boolean {
  if (!isListerAvailabilityRequestRow(order)) return false;
  if (isListerAvailabilityCancelledByRenterRow(order)) return false;
  if (isListerAvailabilityAcceptedRow(order)) return false;
  if (pendingApproval) return true;
  if (isListerAvailabilityExpiredStatusRow(order)) return true;
  if (isListerAvailabilityDeadlinePassed(expiresAt)) return true;
  return false;
}
