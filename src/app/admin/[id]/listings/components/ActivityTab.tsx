"use client";

import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { useProductActivity } from "@/lib/queries/admin/useListings";

interface ActivityTabProps {
  productId: string;
}

export default function ActivityTab({ productId }: ActivityTabProps) {
  const {
    data: activityData,
    isLoading,
    error,
  } = useProductActivity(productId);
  const activities = activityData?.data?.activities || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Paragraph1>Loading activity history...</Paragraph1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Paragraph1 className="text-red-600">
          Failed to load activity history
        </Paragraph1>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Paragraph1 className="text-gray-500">
          No activity history available
        </Paragraph1>
      </div>
    );
  }
  return (
    <div>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const activityDate = new Date(activity.timestamp);
          const formattedDate = activityDate.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
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
                {activity.description && (
                  <Paragraph1 className="text-xs text-gray-600 mt-1">
                    {activity.description}
                  </Paragraph1>
                )}
                <Paragraph1 className="text-xs text-gray-500 mt-1">
                  {formattedDate}
                </Paragraph1>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
