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

/** Check if an order is a pure resale order (listingType === 'RESALE'). */
export function isListerResaleOrder(
  order: Record<string, unknown> | null | undefined,
): boolean {
  if (!order) return false;
  const listingType = String(
    order.listingType ?? order.listing_type ?? "",
  ).trim();
  
  // Check order-level listingType first
  if (listingType === "RESALE") return true;
  if (listingType === "RENTAL") return false;
  
  // If listingType is RENT_OR_RESALE or not set, check items
  const items = order.items as unknown[] | undefined;
  if (items && items.length > 0) {
    // Check if all items are resale (days === 0)
    return items.every((item) => {
      const days = Number((item as Record<string, unknown>).days ?? (item as Record<string, unknown>).rentalDays ?? 0);
      return days === 0;
    });
  }
  
  return false;
}

/** Check if an order is a mixed order (contains both rental and resale items). */
export function isListerMixedOrder(
  order: Record<string, unknown> | null | undefined,
): boolean {
  if (!order) return false;
  const listingType = String(
    order.listingType ?? order.listing_type ?? "",
  ).trim();
  return listingType === "RENT_OR_RESALE";
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

/**
 * At least one resale line: explicit product listing on the line, or any zero-day
 * line on a RESALE / RENT_OR_RESALE order (matches checkout: resale uses days === 0).
 */
export function orderHasAtLeastOneResaleItem(
  order: Record<string, unknown> | null | undefined,
): boolean {
  if (!order) return false;
  if (orderHasResalePurchaseLines(order)) return true;
  const orderLt = String(
    order.listingType ?? order.listing_type ?? "",
  ).trim();
  if (orderLt !== "RESALE" && orderLt !== "RENT_OR_RESALE") return false;
  const items = (order.items ?? order.orderItems) as unknown[] | undefined;
  if (!items?.length) return false;
  return items.some((row) =>
    isResaleItem(row as Record<string, unknown>),
  );
}

/** Order statuses where buyer cannot confirm resale receipt (terminal or blocked). */
const RENTER_RESALE_CONFIRM_BLOCKED = new Set<string>([
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "IN_DISPUTE",
  "RETURNED",
]);

/**
 * Show resale receipt confirm when the order can still be completed by the buyer:
 * RESALE / RENT_OR_RESALE with at least one resale line, and status is not terminal.
 */
export function shouldShowRenterResaleDeliveryConfirm(
  order: Record<string, unknown> | null | undefined,
): boolean {
  if (!order) return false;
  const st = normalizeListerOrderStatusKey(String(order.status ?? ""));
  if (RENTER_RESALE_CONFIRM_BLOCKED.has(st)) return false;
  const lt = String(
    order.listingType ?? order.listing_type ?? "",
  ).trim();
  if (lt !== "RESALE" && lt !== "RENT_OR_RESALE") return false;
  return orderHasAtLeastOneResaleItem(order);
}

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
