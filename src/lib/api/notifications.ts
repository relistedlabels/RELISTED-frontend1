import { apiFetch } from "./http";

export type NotificationType =
  | "ORDER_CONFIRMED"
  | "SHIPMENT_DISPATCHED"
  | "RETURN_DISPATCHED"
  | "RETURN_PICKUP_SCHEDULED"
  | "SHIPMENT_IN_TRANSIT"
  | "RETURN_IN_TRANSIT"
  | "SHIPMENT_DELIVERED"
  | "RETURN_CONFIRMED"
  | "RENTAL_REQUEST"
  | "RENTAL_APPROVED"
  | "RENTAL_REJECTED"
  | "PAYMENT_RECEIVED"
  | "DISPUTE_OPENED"
  | "DISPUTE_RESOLVED"
  | "RETURN_INITIATED"
  | "SYSTEM";

export interface NotificationMetadata {
  status?: string;
  productId?: string;
  requestId?: string;
  orderId?: string;
  shipmentId?: string;
  trackingId?: string;
  trackingUrl?: string;
  [key: string]: any;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata: NotificationMetadata;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
}

export interface MarkReadResponse {
  success: boolean;
  message: string;
  data: Notification;
}

/**
 * Get all notifications for the current user
 */
export const getNotifications = async (): Promise<NotificationsResponse> => {
  return apiFetch<NotificationsResponse>("/notifications", {
    method: "GET",
  });
};

/**
 * Mark a specific notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string,
): Promise<MarkReadResponse> => {
  return apiFetch<MarkReadResponse>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
};
