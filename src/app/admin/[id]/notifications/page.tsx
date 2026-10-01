"use client";

import { useParams } from "next/navigation";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import NotificationsList from "@/components/notifications/NotificationsList";

export default function AdminNotificationsPage() {
  const params = useParams<{ id: string }>();
  const adminId = params.id;

  return (
    <div>
      <AdminPageHeader
        title="Notifications"
        description="Admin alerts and updates."
      />
      <NotificationsList audience="admin" adminId={adminId} />
    </div>
  );
}
