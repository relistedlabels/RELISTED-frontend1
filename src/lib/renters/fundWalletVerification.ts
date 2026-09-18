/**
 * Renters need a valid ID on file before funding a wallet or checking out.
 */
export type RenterProfileLike = { bvn?: string | null } | null | undefined;

export type RenterVerificationsLike = {
  validId?: { status?: string | null };
} | null | undefined;

const VERIFIED_ID_STATUSES = new Set([
  "verified",
  "approved",
  "success",
  "complete",
  "completed",
]);

export function isRenterVerifiedForFundWallet(
  _profile: RenterProfileLike,
  verifications: RenterVerificationsLike,
): boolean {
  const status = (verifications?.validId?.status ?? "").toLowerCase().trim();
  return Boolean(status && VERIFIED_ID_STATUSES.has(status));
}
