"use client";

import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import UserDashboardLayout from "../components/UserDashboardLayout";
import { SITE_FIXED_HEADER_PT } from "@/lib/layout/siteNavOffset";
import NotificationsList from "@/components/notifications/NotificationsList";

export default function RenterNotificationsPage() {
  const path = [
    { label: "Home", href: "/" },
    { label: "My Orders", href: "/renters/orders" },
    { label: "Notifications", href: null },
  ];

  return (
    <div className={`container mx-auto ${SITE_FIXED_HEADER_PT}`}>
      <div className="mb-4 px-4 sm:px-0">
        <Breadcrumbs items={path} />
      </div>
      <UserDashboardLayout title="Notifications">
        <NotificationsList audience="renter" />
      </UserDashboardLayout>
    </div>
  );
}
