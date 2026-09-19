"use client";

import { Bell } from "lucide-react";
import { useParams } from "next/navigation";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import NotificationsList from "@/components/notifications/NotificationsList";

export default function AdminNotificationsPage() {
  const params = useParams<{ id: string }>();
  const adminId = params.id;

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Bell className="h-6 w-6 text-orange-500" />
        <Paragraph2>Notifications</Paragraph2>
      </div>
      <Paragraph1 className="mb-4 text-sm text-gray-500">
        Admin alerts for disputes, withdrawals, and manual fulfillment.
      </Paragraph1>
      <NotificationsList audience="admin" adminId={adminId} />
    </div>
  );
}
