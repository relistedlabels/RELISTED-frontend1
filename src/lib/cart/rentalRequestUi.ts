export function isLineRentalApproved(status?: string): boolean {
  const u = (status ?? "").trim().toUpperCase();
  return u === "APPROVED" || u === "ACCEPTED";
}

/** Countdown only for non-terminal rental statuses (still has expiresAt). */
export function shouldShowRentalRequestTimer(
  status: string | undefined,
  expiresAt: string | undefined,
): boolean {
  if (!expiresAt?.trim()) return false;
  const u = (status ?? "").trim().toUpperCase();
  if (
    u === "APPROVED" ||
    u === "ACCEPTED" ||
    u === "REJECTED" ||
    u === "EXPIRED" ||
    u === "CANCELLED" ||
    u === "DECLINED" ||
    u === "COMPLETED"
  ) {
    return false;
  }
  return true;
}
