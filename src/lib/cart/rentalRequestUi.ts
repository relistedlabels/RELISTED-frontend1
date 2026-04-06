export function isLineRentalApproved(status?: string): boolean {
  const u = (status ?? "").trim().toUpperCase();
  return u === "APPROVED" || u === "ACCEPTED";
}

/** Show an "Expired" badge (API EXPIRED or deadline passed while still awaiting action). */
export function rentalLineIsEffectivelyExpired(
  status: string | undefined,
  expiresAt: string | undefined,
): boolean {
  const u = (status ?? "").trim().toUpperCase();
  if (u === "EXPIRED") return true;
  if (isLineRentalApproved(status)) return false;
  if (
    u === "REJECTED" ||
    u === "CANCELLED" ||
    u === "DECLINED" ||
    u === "COMPLETED"
  ) {
    return false;
  }
  const ex = expiresAt?.trim();
  if (!ex) return false;
  const t = new Date(ex).getTime();
  if (!Number.isFinite(t)) return false;
  return t <= Date.now();
}

/** Countdown only when deadline is still in the future and status is non-terminal. */
export function shouldShowRentalRequestTimer(
  status: string | undefined,
  expiresAt: string | undefined,
): boolean {
  if (!expiresAt?.trim()) return false;
  const deadline = new Date(expiresAt).getTime();
  if (!Number.isFinite(deadline) || deadline <= Date.now()) return false;
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
