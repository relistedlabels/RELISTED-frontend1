/** Must stay in sync with backend ADMIN_ACTIVE_LISTING_STATUSES. */
export const LIVE_ADMIN_LISTING_STATUSES = ["AVAILABLE", "APPROVED"] as const;

export type LiveAdminListingStatus =
  (typeof LIVE_ADMIN_LISTING_STATUSES)[number];

export function canDeactivateListing(status?: string | null): boolean {
  const normalized = status?.toUpperCase() ?? "";
  return (LIVE_ADMIN_LISTING_STATUSES as readonly string[]).includes(normalized);
}

export function buildProductAvailabilityPath(productId: string): string {
  return `/product/${productId}/availability`;
}
