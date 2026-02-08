// ENDPOINTS: GET /api/admin/orders/:orderId/activity
"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface ActivityEvent {
  id: string;
  title: string;
  timestamp: string;
  actor: string;
}

interface OrderSection4Props {
  activities?: ActivityEvent[];
}

const DEFAULT_ACTIVITIES: ActivityEvent[] = [
  {
    id: "1",
    title: "Order placed",
    timestamp: "Oct 10, 2025 - 2:30 PM",
    actor: "Chioma Eze",
  },
  {
    id: "2",
    title: "Payment confirmed",
    timestamp: "Oct 10, 2025 - 2:31 PM",
    actor: "System",
  },
  {
    id: "3",
    title: "Order approved by Curator",
    timestamp: "Oct 10, 2025 - 3:50 PM",
    actor: "Grace Adebayo",
  },
  {
    id: "4",
    title: "Items prepared for shipping",
    timestamp: "Oct 11, 2025 - 10:00 AM",
    actor: "Grace Adebayo",
  },
  {
    id: "5",
    title: "Order picked up by courier",
    timestamp: "Oct 11, 2025 - 2:00 PM",
    actor: "DHL Express",
  },
];

export default function OrderSection4({
  activities = DEFAULT_ACTIVITIES,
}: OrderSection4Props) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <Paragraph3 className="text-base font-bold text-gray-900 mb-4">
        Activity Log
      </Paragraph3>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex gap-3">
            {/* Timeline dot and line */}
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 bg-gray-900 rounded-full mt-1" />
              {index !== activities.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-300 mt-2" />
              )}
            </div>

            {/* Activity content */}
            <div className="pb-2">
              <Paragraph1 className="text-sm font-medium text-gray-900">
                {activity.title}
              </Paragraph1>
              <Paragraph1 className="text-xs text-gray-500 mt-1">
                {activity.timestamp}
                {activity.actor && ` • ${activity.actor}`}
              </Paragraph1>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
