/** Status labels and badge styles for renter order list / detail. */

export function normalizeRenterOrderStatusKey(raw: string): string {
  return raw.trim().toUpperCase().replace(/-/g, "_");
}

/** Human-readable label for order rows and detail header. */
export function getRenterOrderStatusLabel(status: string): string {
  const k = normalizeRenterOrderStatusKey(status || "");
  const map: Record<string, string> = {
    PROCESSING: "Processing",
    ACTIVE: "Active",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    RETURNED: "Returned",
    RETURN_DUE: "Return Due",
  };
  if (!k) return "Unknown";
  return (
    map[k] ??
    status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export type RenterOrderBadgeTone = "success" | "warning" | "danger" | "neutral";

export function getRenterOrderBadgeTone(statusLabel: string): RenterOrderBadgeTone {
  const t = statusLabel.trim();
  
  const lower = t.toLowerCase();
  if (lower.includes("cancel")) return "danger";
  if (lower.includes("return due")) return "warning";
  if (lower.includes("active") || lower.includes("processing")) return "success";
  if (lower.includes("completed") || lower.includes("returned")) return "success";
  
  return "neutral";
}

const TONE_BADGE: Record<RenterOrderBadgeTone, string> = {
  success: "bg-green-100 text-green-800 border border-green-200",
  warning: "bg-[#FFF9E5] text-[#D4A017] border border-yellow-200",
  danger: "bg-red-100 text-red-700 border border-red-200",
  neutral: "bg-gray-100 text-gray-700 border border-gray-200",
};

export function getRenterOrderBadgeClassName(statusLabel: string): string {
  return TONE_BADGE[getRenterOrderBadgeTone(statusLabel)];
}
