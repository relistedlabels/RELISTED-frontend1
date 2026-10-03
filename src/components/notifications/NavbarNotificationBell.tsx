"use client";

import NotificationBell from "@/components/notifications/NotificationBell";
import { useNotificationInboxHref } from "@/lib/queries/notifications/useNotificationInboxHref";

type NavbarNotificationBellProps = {
  iconClassName?: string;
  badgeClassName?: string;
  className?: string;
};

export default function NavbarNotificationBell({
  iconClassName = "h-5 w-5 text-white",
  badgeClassName = "absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-black",
  className = "relative flex items-center justify-center",
}: NavbarNotificationBellProps) {
  const href = useNotificationInboxHref();

  if (!href) return null;

  return (
    <NotificationBell
      href={href}
      className={className}
      iconClassName={iconClassName}
      badgeClassName={badgeClassName}
    />
  );
}
