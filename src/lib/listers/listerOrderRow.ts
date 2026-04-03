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
  return new Date(s).getTime() <= Date.now();
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
