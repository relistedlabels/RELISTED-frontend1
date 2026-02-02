"use client";

import React from "react";
import { Paragraph1 } from "@/common/ui/Text";

interface Activity {
  id: string;
  title: string;
  timestamp: string;
}

interface ActivityTabProps {
  activities?: Activity[];
}

const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: "1",
    title: "Listed by Grace Adebayo",
    timestamp: "Oct 8, 2025 at 2:30 PM",
  },
  {
    id: "2",
    title: "Approved by Admin",
    timestamp: "Oct 8, 2025 at 9:15 AM",
  },
  {
    id: "3",
    title: "Rented by Chioma Eze",
    timestamp: "Oct 10, 2025",
  },
  {
    id: "4",
    title: "Returned",
    timestamp: "Oct 13, 2025",
  },
  {
    id: "5",
    title: "Rented by Aniia Cole",
    timestamp: "Oct 14, 2025",
  },
  {
    id: "6",
    title: "Returned",
    timestamp: "Oct 20, 2025",
  },
  {
    id: "7",
    title: "Last updated",
    timestamp: "2 days ago",
  },
];

export default function ActivityTab({
  activities = DEFAULT_ACTIVITIES,
}: ActivityTabProps) {
  return (
    <div>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex gap-4">
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 bg-gray-900 rounded-full mt-2" />
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
              </Paragraph1>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
