/** Strip shipbubble-style prefix for admin shipment detail display. */
export function formatAdminPricingTier(
  tier: string | null | undefined,
): string {
  if (!tier?.trim()) return "—";
  const colon = tier.indexOf(":");
  return colon >= 0 ? tier.slice(colon + 1) : tier;
}
