import type { NotificationMetadata } from "@/lib/api/notifications";

export type NotificationAudience = "lister" | "renter" | "admin";

export const getNotificationHref = (
  metadata: NotificationMetadata,
  audience: NotificationAudience,
  adminId?: string,
): string | null => {
  const orderId =
    typeof metadata.orderId === "string" ? metadata.orderId.trim() : "";
  const requestId =
    typeof metadata.requestId === "string" ? metadata.requestId.trim() : "";
  const orderPageUrl =
    typeof metadata.orderPageUrl === "string"
      ? metadata.orderPageUrl.trim()
      : "";

  if (orderPageUrl.startsWith("/")) {
    return orderPageUrl;
  }

  if (audience === "renter") {
    if (orderId) return `/renters/orders?orderId=${encodeURIComponent(orderId)}`;
    return null;
  }

  if (audience === "lister") {
    if (requestId) {
      return `/listers/orders/${encodeURIComponent(requestId)}`;
    }
    if (orderId) {
      return `/listers/orders/${encodeURIComponent(orderId)}`;
    }
    return null;
  }

  if (audience === "admin" && adminId) {
    if (orderId) {
      return `/admin/${adminId}/orders?orderId=${encodeURIComponent(orderId)}`;
    }
    return `/admin/${adminId}/orders`;
  }

  return null;
};
