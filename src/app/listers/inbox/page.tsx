"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, HelpCircle } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import Link from "next/link";
import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../components/DashboardLayout";

const mockInbox = [
  {
    id: "msg_1",
    subject: "New Availability Request",
    summary: "You have a new rental request for GUCCI LEATHER BAG.",
    details:
      "A renter has requested to rent your GUCCI LEATHER BAG. Review and approve or reject the request on the Orders page.",
    date: "2026-02-27T12:00:00Z",
    link: "/listers/orders",
    linkLabel: "Go to Orders",
  },
  {
    id: "msg_2",
    subject: "Delivery Update: FENDI ARCO BOOTS",
    summary: "Delivery status changed: Out for delivery.",
    details:
      "Your item FENDI ARCO BOOTS is now out for delivery. Track the delivery status for real-time updates.",
    date: "2026-02-27T10:30:00Z",
    link: "/listers/orders",
    linkLabel: "Track Delivery",
  },
  {
    id: "msg_3",
    subject: "Dispute Opened: GUCCI LEATHER BAG",
    summary: "A dispute has been opened by the renter.",
    details:
      "A renter has opened a dispute for GUCCI LEATHER BAG. Please review and respond on the Dispute page.",
    date: "2026-02-26T15:00:00Z",
    fromDispute: true,
    disputeId: "dispute_456",
  },
  {
    id: "msg_4",
    subject: "Delivery Completed: PRADA DRESS",
    summary: "Delivery for PRADA DRESS has been completed.",
    details:
      "The item PRADA DRESS has been successfully delivered to the renter.",
    date: "2026-02-25T18:00:00Z",
    link: "/listers/orders",
    linkLabel: "View Order",
  },
  {
    id: "msg_5",
    subject: "Welcome to Relisted",
    summary: "Thank you for joining Relisted.",
    details:
      "We're excited to have you on board. Explore inventory and start listing.",
    date: "2026-02-25T09:00:00Z",
  },
];

export default function InboxPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const path = [
    { label: "Dashboard", href: "/listers/dashboard" },
    { label: "Inbox", href: null },
  ];
  return (
    <DashboardLayout>
      <div className="mb-4 px-4 sm:px-0">
        <Breadcrumbs items={path} />
      </div>
      <div className="mb-4 px-4 sm:px-0 flex items-center gap-2">
        <Mail className="w-6 h-6  " />
        <Paragraph2>Inbox</Paragraph2>
      </div>
      <div className="space-y-4">
        {mockInbox.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-50 rounded-lg p-4 shadow-sm transition-all"
          >
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setOpenId(openId === msg.id ? null : msg.id)}
            >
              <div>
                <Paragraph1 className="font-semibold text-gray-900">
                  {msg.subject}
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-600 mt-1">
                  {msg.summary}
                </Paragraph1>
                <Paragraph1 className="text-xs text-gray-400 mt-1">
                  {new Date(msg.date).toLocaleString()}
                </Paragraph1>
              </div>
              <span className="text-xs text-blue-500">
                {openId === msg.id ? "Hide" : "View"}
              </span>
            </div>
            {openId === msg.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 border-t pt-3 text-gray-700"
              >
                <Paragraph1>{msg.details}</Paragraph1>
                {msg.fromDispute && msg.disputeId && (
                  <Link
                    href={`/listers/dispute?id=${msg.disputeId}`}
                    className="mt-2 inline-flex items-center gap-2 text-orange-600 hover:underline text-sm font-medium"
                  >
                    <HelpCircle className="w-4 h-4" /> Learn more
                  </Link>
                )}
                {msg.link && msg.linkLabel && (
                  <Link
                    href={msg.link}
                    className="mt-2 inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium"
                  >
                    {msg.linkLabel}
                  </Link>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
