"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Bell } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../components/DashboardLayout";

const mockNotifications = [
  {
    id: "notif_1",
    title: "New Login Detected",
    summary: "A new login to your account was detected from Lagos, Nigeria.",
    details:
      "If this was you, no action is needed. If not, please secure your account immediately.",
    date: "2026-02-27T10:00:00Z",
    read: false,
  },
  {
    id: "notif_2",
    title: "Payment Received",
    summary: "You received a payment of ₦50,000 for a completed rental.",
    details:
      "Funds have been credited to your wallet. View your wallet for details.",
    date: "2026-02-27T09:00:00Z",
    read: false,
  },
  {
    id: "notif_3",
    title: "Feature Update: Auto-Payments",
    summary: "Auto-payments are now available for all rentals.",
    details:
      "Enable auto-pay to streamline your rental process and never miss a payment.",
    date: "2026-02-26T18:00:00Z",
    read: true,
  },
  {
    id: "notif_4",
    title: "Welcome to Relisted!",
    summary: "We're excited to have you on board.",
    details: "Explore the platform, list your first item, and start earning.",
    date: "2026-02-25T08:00:00Z",
    read: true,
  },
  {
    id: "notif_5",
    title: "Happy New Month!",
    summary: "Wishing you a successful month on Relisted.",
    details:
      "Check out this month's tips and best practices to maximize your earnings.",
    date: "2026-02-01T07:00:00Z",
    read: true,
  },
  {
    id: "notif_6",
    title: "Monthly Tip: Optimize Your Listings",
    summary: "High-quality photos and detailed descriptions boost rentals.",
    details:
      "Update your listings to attract more renters and increase your income.",
    date: "2026-02-01T07:00:00Z",
    read: true,
  },
  {
    id: "notif_7",
    title: "Market Trends: Best Performing Categories",
    summary: "Dresses and Bags are trending this month.",
    details:
      "List more items in these categories to take advantage of high demand.",
    date: "2026-02-01T07:00:00Z",
    read: true,
  },
  {
    id: "notif_8",
    title: "Platform Update: 1,200 Users Online",
    summary: "There are currently 1,200 users active on Relisted.",
    details:
      "More users means more opportunities for your listings to be seen and rented.",
    date: "2026-02-27T11:00:00Z",
    read: false,
  },
];

export default function NotificationsPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const path = [
    { label: "Dashboard", href: "/listers/dashboard" },
    { label: "Notifications", href: null },
  ];
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
        {mockNotifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white border border-gray-50 rounded-lg p-4 shadow-sm transition-all ${notif.read ? "opacity-70" : ""}`}
          >
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setOpenId(openId === notif.id ? null : notif.id)}
            >
              <div>
                <Paragraph1 className="font-semibold text-gray-900">
                  {notif.title}
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-600 mt-1">
                  {notif.summary}
                </Paragraph1>
                <Paragraph1 className="text-xs text-gray-400 mt-1">
                  {new Date(notif.date).toLocaleString()}
                </Paragraph1>
              </div>
              <span className="text-xs text-orange-500">
                {openId === notif.id ? "Hide" : "View"}
              </span>
            </div>
            {openId === notif.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 border-t pt-3 text-gray-700"
              >
                <Paragraph1>{notif.details}</Paragraph1>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
