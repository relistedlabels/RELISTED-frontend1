import { apiFetch } from "./http";

export type NotificationType = string;

export interface NotificationMetadata {
  status?: string;
  productId?: string;
  requestId?: string;
  orderId?: string;
  shipmentId?: string;
  trackingId?: string;
  trackingUrl?: string;
  orderPageUrl?: string;
  [key: string]: unknown;
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

export interface NotificationsPageData {
  items: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  days: number;
  hasMore: boolean;
}

export interface NotificationsResponse {
  success: boolean;
  data: NotificationsPageData;
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
    days: number;
  };
}

export interface MarkReadResponse {
  success: boolean;
  message: string;
  data: Notification;
}

export interface MarkAllReadResponse {
  success: boolean;
  message: string;
  data: {
    markedCount: number;
  };
}

export const NOTIFICATION_DEFAULT_DAYS = 30;
export const NOTIFICATION_DEFAULT_LIMIT = 30;

export const getNotifications = async (options?: {
  page?: number;
  limit?: number;
  days?: number;
}): Promise<NotificationsResponse> => {
  const params = new URLSearchParams();
  if (options?.page) params.set("page", String(options.page));
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.days) params.set("days", String(options.days));
  const query = params.toString();
  return apiFetch<NotificationsResponse>(
    `/notifications${query ? `?${query}` : ""}`,
    { method: "GET" },
  );
};

export const getNotificationUnreadCount = async (
  days = NOTIFICATION_DEFAULT_DAYS,
): Promise<UnreadCountResponse> => {
  return apiFetch<UnreadCountResponse>(
    `/notifications/unread-count?days=${days}`,
    { method: "GET" },
  );
};

export const markNotificationAsRead = async (
  notificationId: string,
): Promise<MarkReadResponse> => {
  return apiFetch<MarkReadResponse>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
};

export const markAllNotificationsAsRead = async (
  days = NOTIFICATION_DEFAULT_DAYS,
): Promise<MarkAllReadResponse> => {
  return apiFetch<MarkAllReadResponse>(
    `/notifications/read-all?days=${days}`,
    { method: "PATCH" },
  );
};
