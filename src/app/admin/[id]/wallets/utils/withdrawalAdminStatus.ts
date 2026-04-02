/** Normalize admin withdrawal list status for comparisons (API may send mixed case). */
export function normalizeAdminWithdrawalStatus(status: string | undefined): string {
  return String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

/** Request is waiting for admin approval before payout can be recorded. */
const NEEDS_APPROVAL = new Set([
  "pending",
  "pending_approval",
  "pending_admin_approval",
  "awaiting_approval",
  "submitted",
  "under_review",
]);

/** Request was approved; admin records bank transfer with tracking ID. */
const READY_FOR_PAYOUT = new Set([
  "approved",
  "processing",
  "ready",
  "ready_for_payout",
  "in_processing",
  "queued_for_payout",
]);

export function withdrawalShowsApprove(status: string | undefined): boolean {
  return NEEDS_APPROVAL.has(normalizeAdminWithdrawalStatus(status));
}

export function withdrawalShowsMarkPaid(status: string | undefined): boolean {
  const n = normalizeAdminWithdrawalStatus(status);
  // Include `pending` so one-step APIs (pending → paid only) still show Mark as paid;
  // two-step flows can use Approve first, then Mark as paid once status is approved/processing.
  return READY_FOR_PAYOUT.has(n) || n === "pending";
}

export function withdrawalAdminStatusLabel(status: string | undefined): string {
  const n = normalizeAdminWithdrawalStatus(status);
  if (!n) return "—";
  return n.replace(/_/g, " ");
}
