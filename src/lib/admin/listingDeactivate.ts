export function canDeactivateListing(status?: string | null): boolean {
  const normalized = status?.toUpperCase() ?? "";
  return normalized === "AVAILABLE" || normalized === "APPROVED";
}

export function buildProductAvailabilityPath(productId: string): string {
  return `/product/${productId}/availability`;
}
