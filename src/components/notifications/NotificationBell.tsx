"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useNotificationUnreadCount } from "@/lib/queries/notifications/useNotificationUnreadCount";

type NotificationBellProps = {
  href: string;
  className?: string;
  iconClassName?: string;
  badgeClassName?: string;
};

export default function NotificationBell({
  href,
  className = "relative",
  iconClassName = "w-5 h-5 cursor-pointer",
  badgeClassName = "absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white",
}: NotificationBellProps) {
  const { data: unreadCount = 0 } = useNotificationUnreadCount();
  const hasUnread = unreadCount > 0;

  return (
    <Link href={href} className={className} aria-label="Notifications">
      <Bell className={iconClassName} />
      {hasUnread ? (
        <span className={badgeClassName} aria-hidden="true" />
      ) : null}
    </Link>
  );
}
