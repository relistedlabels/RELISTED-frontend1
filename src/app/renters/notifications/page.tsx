"use client";

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import UserDashboardLayout from "../components/UserDashboardLayout";
import NotificationsList from "@/components/notifications/NotificationsList";

export default function RenterNotificationsPage() {
  const path = [
    { label: "Home", href: "/" },
    { label: "My Orders", href: "/renters/orders" },
    { label: "Notifications", href: null },
  ];

  return (
    <div className="container mx-auto pt-[70px] sm:pt-[100px]">
      <div className="mb-4 px-4 sm:px-0">
        <Breadcrumbs items={path} />
      </div>
      <UserDashboardLayout title="Notifications">
        <NotificationsList audience="renter" />
      </UserDashboardLayout>
    </div>
  );
}
