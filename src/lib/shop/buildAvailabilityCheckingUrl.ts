export function buildAvailabilityCheckingUrl(params: {
  requestId: string;
  token?: string | null;
  productId?: string | null;
}): string {
  const query = new URLSearchParams();
  query.set("requestId", params.requestId);
  if (params.token?.trim()) {
    query.set("token", params.token.trim());
  }
  if (params.productId?.trim()) {
    query.set("productId", params.productId.trim());
  }
  return `/shop/availability/checking?${query.toString()}`;
}
