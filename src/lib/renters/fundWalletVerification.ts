/**
 * Fund wallet UI historically gated on profile.bvn only. The profile API may omit
 * raw BVN while GET .../verifications/status still reports verified + maskedValue.
 * Align with Account Verifications (bvn status + masked value).
 */
export type RenterProfileLike = { bvn?: string | null } | null | undefined;

export type RenterVerificationsLike = {
  bvn?: { status?: string | null; maskedValue?: string | null };
} | null | undefined;

const VERIFIED_BVN_STATUSES = new Set([
  "verified",
  "approved",
  "success",
  "complete",
  "completed",
]);

export function isRenterVerifiedForFundWallet(
  profile: RenterProfileLike,
  verifications: RenterVerificationsLike,
): boolean {
  const bvnOnProfile = profile?.bvn?.trim();
  if (bvnOnProfile) return true;

  const bvn = verifications?.bvn;
  const masked = bvn?.maskedValue?.trim();
  if (masked) return true;

  const status = (bvn?.status ?? "").toLowerCase().trim();
  if (status && VERIFIED_BVN_STATUSES.has(status)) return true;

  return false;
}
