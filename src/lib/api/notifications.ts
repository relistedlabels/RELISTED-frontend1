import { apiFetch } from "./http";

export interface NotificationMetadata {
  status?: string;
  productId?: string;
  requestId?: string;
  [key: string]: any;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
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
