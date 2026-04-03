/** Status labels and badge styles for lister order list / detail. */

export function normalizeListerOrderStatusKey(raw: string): string {
  return raw.trim().toUpperCase().replace(/-/g, "_");
}

const PENDING_SHAPED = new Set([
  "PENDING",
  "PENDING_APPROVAL",
  "PENDING_LISTER_APPROVAL",
]);

function pickStatusForDisplay(order: Record<string, unknown> | null | undefined): string {
  if (!order) return "";
  const av =
    (typeof order.availabilityStatus === "string" &&
      order.availabilityStatus.trim()) ||
    (typeof order.availability_status === "string" &&
      order.availability_status.trim()) ||
    "";
  const st =
    typeof order.status === "string" ? order.status.trim() : "";
  const stk = st ? normalizeListerOrderStatusKey(st) : "";

  if (av && (!st || PENDING_SHAPED.has(stk))) {
    return av;
  }
  return st || av;
}

/** Human-readable label for order rows and detail header. */
export function getListerOrderStatusLabel(
  order: Record<string, unknown> | null | undefined,
): string {
  const raw = pickStatusForDisplay(order);
  return formatListerOrderStatusLabel(raw);
}

export function formatListerOrderStatusLabel(raw: string): string {
  const k = normalizeListerOrderStatusKey(raw || "");
  const map: Record<string, string> = {
    PENDING: "Pending Approval",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    EXPIRED: "Expired",
    CANCELLED_BY_RENTER: "Cancelled by Renter",
    PENDING_APPROVAL: "Pending Approval",
    PENDING_LISTER_APPROVAL: "Pending Approval",
    ONGOING: "Approved",
    APPROVED: "Approved",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    RETURN_DUE: "Return Due",
    PROCESSING: "Processing",
    CONFIRMED: "Confirmed",
    IN_TRANSIT: "In Transit",
    DELIVERED: "Delivered",
    ACTIVE: "Active",
    RETURNED: "Returned",
  };
  if (!k) return "Unknown";
  return (
    map[k] ??
    raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/** Pending lister decision on availability. */
export function isListerAvailabilityPending(
  order: Record<string, unknown> | null | undefined,
): boolean {
  const raw = pickStatusForDisplay(order);
  const k = normalizeListerOrderStatusKey(raw);
  return PENDING_SHAPED.has(k);
}

const BADGE_GREEN_LABELS = new Set([
  "Accepted",
  "Approved",
  "In Progress",
  "Processing",
  "Confirmed",
  "In Transit",
  "Delivered",
  "Active",
  "Completed",
  "Returned",
]);

const BADGE_RED_LABELS = new Set([
  "Rejected",
  "Expired",
  "Cancelled",
  "Cancelled by Renter",
]);

export type ListerOrderBadgeTone = "success" | "warning" | "danger" | "neutral";

export function getListerOrderBadgeToneFromLabel(
  statusLabel: string,
): ListerOrderBadgeTone {
  const t = statusLabel.trim();
  if (BADGE_GREEN_LABELS.has(t)) return "success";
  if (BADGE_RED_LABELS.has(t)) return "danger";
  if (t === "Pending Approval" || t === "Return Due") return "warning";

  const lower = t.toLowerCase();
  if (
    lower.includes("reject") ||
    lower.includes("expir") ||
    lower.includes("cancel")
  ) {
    return "danger";
  }
  if (lower.includes("pending") || lower.includes("return due")) {
    return "warning";
  }
  if (
    lower.includes("accept") ||
    lower.includes("approv") ||
    lower.includes("progress") ||
    lower.includes("process") ||
    lower.includes("confirm") ||
    lower.includes("transit") ||
    lower.includes("deliver") ||
    lower.includes("active") ||
    lower.includes("complet") ||
    lower.includes("returned")
  ) {
    return "success";
  }

  return "neutral";
}

const TONE_BADGE: Record<ListerOrderBadgeTone, string> = {
  success: "bg-green-100 text-green-800 border border-green-200",
  warning: "bg-[#FFF9E5] text-[#D4A017] border border-yellow-200",
  danger: "bg-red-100 text-red-700 border border-red-200",
  neutral: "bg-gray-100 text-gray-700 border border-gray-200",
};

export function getListerOrderBadgeClassName(statusLabel: string): string {
  return TONE_BADGE[getListerOrderBadgeToneFromLabel(statusLabel)];
}
