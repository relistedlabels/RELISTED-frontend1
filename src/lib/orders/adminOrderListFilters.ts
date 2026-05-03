/**
 * Admin orders page filter chips → `GET /api/admin/orders?status=…`
 * Backend uses Prisma `OrderStatus` enum strings (uppercase snake).
 * Special value `Returns` switches to the returns list endpoint (handled in useOrders).
 */
export function adminOrderListStatusToApiParam(
  uiFilter: string,
): string | undefined {
  if (!uiFilter || uiFilter === "All") return undefined;
  if (uiFilter === "Returns") return "Returns";

  const map: Record<string, string> = {
    /** Post-acceptance / pre-pickup pipeline */
    Preparing: "CONFIRMED",
    "In Transit": "IN_TRANSIT",
    Delivered: "DELIVERED",
    "Return Due": "RETURN_DUE",
    /** No separate Prisma value — same bucket as return window */
    "Return Pickup": "RETURN_DUE",
    Disputed: "IN_DISPUTE",
  };

  return map[uiFilter];
}
