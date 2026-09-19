"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useNotifications } from "@/lib/queries/notifications/useNotifications";
import { useMarkNotificationAsRead } from "@/lib/mutations/notifications/useMarkNotificationAsRead";
import { useMarkAllNotificationsAsRead } from "@/lib/mutations/notifications/useMarkAllNotificationsAsRead";
import { getNotificationIcon } from "@/lib/utils/notificationIcons";
import {
  getNotificationHref,
  type NotificationAudience,
} from "@/lib/utils/notificationLinks";
import type { Notification } from "@/lib/api/notifications";
import { NOTIFICATION_DEFAULT_DAYS } from "@/lib/api/notifications";

type NotificationsListProps = {
  audience: NotificationAudience;
  adminId?: string;
};

export default function NotificationsList({
  audience,
  adminId,
}: NotificationsListProps) {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const pages = data?.pages ?? [];
  const items = pages.flatMap((page) => page.items);
  const unreadCount = pages[0]?.unreadCount ?? 0;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <Paragraph1 className="text-gray-500">
          Loading notifications...
        </Paragraph1>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-center">
        <Paragraph1 className="text-red-500">
          Failed to load notifications
        </Paragraph1>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-0">
        <Paragraph1 className="text-sm text-gray-500">
          Showing the last {NOTIFICATION_DEFAULT_DAYS} days
          {unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
        </Paragraph1>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-50"
          >
            {markAllAsRead.isPending ? "Updating..." : "Mark all as read"}
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <Paragraph1 className="text-gray-500">
            No notifications in the last {NOTIFICATION_DEFAULT_DAYS} days
          </Paragraph1>
        </div>
      ) : (
        items.map((notif) => {
          const {
            icon: Icon,
            color,
            bgColor,
          } = getNotificationIcon(notif.type);
          const href = getNotificationHref(notif.metadata, audience, adminId);
          const cardClassName = `block bg-white border rounded-lg p-4 shadow-sm transition-all ${
            notif.isRead ? "border-gray-50 opacity-80" : "border-orange-200"
          }`;

          const content = (
            <div className="flex items-start gap-3">
              <div className={`shrink-0 rounded-lg p-2 ${bgColor}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Paragraph1 className="font-semibold text-gray-900">
                    {notif.title}
                  </Paragraph1>
                  {!notif.isRead ? (
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                  ) : null}
                </div>
                <Paragraph1 className="mt-1 text-sm text-gray-600">
                  {notif.message}
                </Paragraph1>
                {notif.metadata.trackingId ? (
                  <div className="mt-2 rounded-md bg-gray-50 p-2">
                    <Paragraph1 className="mb-1 text-xs text-gray-500">
                      Tracking ID: {String(notif.metadata.trackingId)}
                    </Paragraph1>
                    {notif.metadata.trackingUrl ? (
                      <a
                        href={String(notif.metadata.trackingUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                        onClick={(event) => event.stopPropagation()}
                      >
                        Track shipment
                      </a>
                    ) : null}
                  </div>
                ) : null}
                <Paragraph1 className="mt-2 text-xs text-gray-400">
                  {new Date(notif.createdAt).toLocaleString()}
                </Paragraph1>
              </div>
            </div>
          );

          if (href) {
            return (
              <Link
                key={notif.id}
                href={href}
                className={cardClassName}
                onClick={() => handleNotificationClick(notif)}
              >
                {content}
              </Link>
            );
          }

          return (
            <div
              key={notif.id}
              className={`${cardClassName} cursor-default`}
              onClick={() => handleNotificationClick(notif)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  handleNotificationClick(notif);
                }
              }}
              role="button"
              tabIndex={0}
            >
              {content}
            </div>
          );
        })
      )}

      {hasNextPage ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
