"use client";

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import UserDashboardLayout from "../components/UserDashboardLayout";
import NotificationsList from "@/components/notifications/NotificationsList";

export default function RenterNotificationsPage() {
  const path = [
    { label: "My Orders", href: "/renters/orders" },
    { label: "Notifications", href: null },
  ];

  return (
    <UserDashboardLayout title="Notifications">
      <div className="mb-4">
        <Breadcrumbs items={path} />
      </div>
      <NotificationsList audience="renter" />
    </UserDashboardLayout>
  );
}
