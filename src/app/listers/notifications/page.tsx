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
import { getNotificationIcon } from "@/lib/utils/notificationIcons";

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
      <div className="flex items-center gap-2 mb-4 px-4 sm:px-0">
        <Bell className="w-6 h-6 text-orange-500" />
        <Paragraph2>Notifications</Paragraph2>
      </div>
      <div className="space-y-4">
        {isLoading && (
          <div className="py-8 text-center">
            <Paragraph1 className="text-gray-500">
              Loading notifications...
            </Paragraph1>
          </div>
        )}
        {isError && (
          <div className="py-8 text-center">
            <Paragraph1 className="text-red-500">
              Failed to load notifications
            </Paragraph1>
          </div>
        )}
        {!isLoading && !isError && notifications.length === 0 && (
          <div className="py-8 text-center">
            <Paragraph1 className="text-gray-500">
              No notifications yet
            </Paragraph1>
          </div>
        )}
        {notifications.map((notif) => {
          const {
            icon: Icon,
            color,
            bgColor,
          } = getNotificationIcon(notif.type);
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white border border-gray-50 rounded-lg p-4 shadow-sm transition-all ${notif.isRead ? "opacity-70" : "border-orange-200"}`}
            >
              <div className="flex justify-between items-start">
                <Link
                  href={
                    notif.metadata.orderId
                      ? `/listers/orders/${notif.metadata.orderId}`
                      : `/listers/orders/${notif.metadata.requestId}`
                  }
                  className="flex-1 cursor-pointer"
                  onClick={() =>
                    setOpenId(openId === notif.id ? null : notif.id)
                  }
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${bgColor} shrink-0`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Paragraph1 className="font-semibold text-gray-900">
                          {notif.title}
                        </Paragraph1>
                        {!notif.isRead && (
                          <span className="bg-orange-500 rounded-full w-2 h-2"></span>
                        )}
                      </div>
                      <Paragraph1 className="mt-1 text-gray-600 text-sm">
                        {notif.message}
                      </Paragraph1>
                      {notif.metadata.trackingId && (
                        <div className="bg-gray-50 mt-2 p-2 rounded-md">
                          <Paragraph1 className="mb-1 text-gray-500 text-xs">
                            Tracking ID: {notif.metadata.trackingId}
                          </Paragraph1>
                          {notif.metadata.trackingUrl && (
                            <a
                              href={notif.metadata.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 text-xs hover:underline"
                            >
                              Track on Topship
                            </a>
                          )}
                        </div>
                      )}
                      <Paragraph1 className="mt-1 text-gray-400 text-xs">
                        {new Date(notif.createdAt).toLocaleString()}
                      </Paragraph1>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-gray-500 text-xs">
                    {openId === notif.id ? "Hide" : "View"}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
