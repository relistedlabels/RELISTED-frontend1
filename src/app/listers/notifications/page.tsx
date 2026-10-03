"use client";

import { Bell } from "lucide-react";
import { Paragraph2 } from "@/common/ui/Text";
import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../components/DashboardLayout";
import NotificationsList from "@/components/notifications/NotificationsList";

export default function NotificationsPage() {
  const path = [
    { label: "Dashboard", href: "/listers/dashboard" },
    { label: "Notifications", href: null },
  ];

  return (
    <DashboardLayout>
      <div className="mb-4 px-4 sm:px-0">
        <Breadcrumbs items={path} />
      </div>
      <div className="mb-4 flex items-center gap-2 px-4 sm:px-0">
        <Bell className="h-6 w-6 text-orange-500" />
        <Paragraph2>Notifications</Paragraph2>
      </div>
      <NotificationsList audience="lister" />
    </DashboardLayout>
  );
}
