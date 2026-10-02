/** Lister commission shown in the UI. Must match the backend LISTER_PLATFORM_FEE_PERCENT. */
export const LISTER_PLATFORM_FEE_PERCENT = (() => {
  const n = Number(process.env.NEXT_PUBLIC_LISTER_PLATFORM_FEE_PERCENT);
  return Number.isFinite(n) &&
    n >= 0 &&
    n <= 100 &&
    process.env.NEXT_PUBLIC_LISTER_PLATFORM_FEE_PERCENT
    ? n
    : 10;
})();

export function computePlatformFee(
  amount: number,
  percent: number = LISTER_PLATFORM_FEE_PERCENT,
): number {
  const base = Math.max(0, Math.round(Number(amount) || 0));
  if (base === 0 || percent <= 0) return 0;
  return Math.min(base, Math.round((base * percent) / 100));
}

export function amountAfterPlatformFee(
  amount: number,
  percent: number = LISTER_PLATFORM_FEE_PERCENT,
): number {
  const base = Math.max(0, Math.round(Number(amount) || 0));
  return base - computePlatformFee(base, percent);
}
