"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../components/DashboardLayout";
import { useNotifications } from "@/lib/queries/notifications/useNotifications";
import { useMarkNotificationAsRead } from "@/lib/mutations/notifications/useMarkNotificationAsRead";
import Link from "next/link";

export default function NotificationsPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const { data: notifications = [], isLoading, isError } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const path = [
    { label: "Dashboard", href: "/listers/dashboard" },
    { label: "Notifications", href: null },
  ];

  useEffect(() => {
    const unreadNotifications = notifications.filter((notif) => !notif.isRead);
    unreadNotifications.forEach((notif) => {
      markAsRead.mutate(notif.id);
    });
  }, [notifications, markAsRead]);

  return (
    <DashboardLayout>
      <div className="mb-4 px-4 sm:px-0">
        <Breadcrumbs items={path} />
      </div>
      <div className="mb-4 px-4 sm:px-0 flex items-center gap-2">
        <Bell className="w-6 h-6 text-orange-500" />
        <Paragraph2>Notifications</Paragraph2>
      </div>
      <div className=" space-y-4">
        {isLoading && (
          <div className="text-center py-8">
            <Paragraph1 className="text-gray-500">
              Loading notifications...
            </Paragraph1>
          </div>
        )}
        {isError && (
          <div className="text-center py-8">
            <Paragraph1 className="text-red-500">
              Failed to load notifications
            </Paragraph1>
          </div>
        )}
        {!isLoading && !isError && notifications.length === 0 && (
          <div className="text-center py-8">
            <Paragraph1 className="text-gray-500">
              No notifications yet
            </Paragraph1>
          </div>
        )}
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white border border-gray-50 rounded-lg p-4 shadow-sm transition-all ${notif.isRead ? "opacity-70" : "border-orange-200"}`}
          >
            <div className="flex justify-between items-start">
              <Link
                href={`/listers/orders/${notif.metadata.requestId}`}
                className="flex-1 cursor-pointer"
                onClick={() => setOpenId(openId === notif.id ? null : notif.id)}
              >
                <div className="flex items-center gap-2">
                  <Paragraph1 className="font-semibold text-gray-900">
                    {notif.title}
                  </Paragraph1>
                  {!notif.isRead && (
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  )}
                </div>
                <Paragraph1 className="text-sm text-gray-600 mt-1">
                  {notif.message}
                </Paragraph1>
                <Paragraph1 className="text-xs text-gray-400 mt-1">
                  {new Date(notif.createdAt).toLocaleString()} · {notif.type}
                </Paragraph1>
              </Link>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-xs text-gray-500">
                  {openId === notif.id ? "Hide" : "View"}
                </span>
              </div>
            </div>
          
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
