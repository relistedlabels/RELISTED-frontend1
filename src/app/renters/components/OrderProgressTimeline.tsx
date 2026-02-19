// ENDPOINTS: GET /api/renters/orders/:orderId/progress

"use client";

import React, { useEffect, useState } from "react";
// Lucide icons for visual representation
import {
  CheckCircle,
  Package,
  Truck,
  Home,
  RefreshCw,
  Thermometer,
  Loader,
} from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useOrderProgress } from "@/lib/queries/renters/useOrderDetails";

// --- Configuration for Timeline Stages ---
interface TimelineStage {
  id: number;
  label: string;
  description: string;
  icon: React.ElementType;
  milestone?: string;
  timestamp?: string;
}

interface OrderProgressTimelineProps {
  orderId: string;
}

// Skeleton Loader
const TimelineSkeleton = () => (
  <div className="p-6 bg-white border border-gray-300 rounded-xl animate-pulse">
    <div className="h-7 w-32 bg-gray-200 rounded mb-6"></div>
    <div className="relative border-l-2 border-gray-200 pl-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="mb-8">
          <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-48 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

export default function OrderProgressTimeline({
  orderId,
}: OrderProgressTimelineProps) {
  const { data, isLoading, error } = useOrderProgress(orderId);
  const [currentStageId, setCurrentStageId] = useState(0);

  // Map API milestone to stage ID
  const milestoneToStageId: Record<string, number> = {
    order_placed: 1,
    payment_processed: 2,
    item_packaged: 2,
    in_transit: 3,
    delivered: 4,
    rental_active: 4,
    return_collected: 5,
    completed: 6,
  };

  useEffect(() => {
    if (data?.currentMilestone) {
      const stageId = milestoneToStageId[data.currentMilestone] || 1;
      setCurrentStageId(stageId);
    }
  }, [data?.currentMilestone]);

  if (isLoading) {
    return <TimelineSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 bg-white border border-gray-300 rounded-xl">
        <Paragraph1 className="text-red-500">
          Failed to load order progress. Please try again.
        </Paragraph1>
      </div>
    );
  }

  if (!data?.timeline) {
    return (
      <div className="p-6 bg-white border border-gray-300 rounded-xl">
        <Paragraph1 className="text-gray-600">
          No progress data available.
        </Paragraph1>
      </div>
    );
  }

  // Build timeline from API data
  const getBuildStages = (): TimelineStage[] => {
    const mapMilestoneToStage = (item: any): TimelineStage | null => {
      const milestoneMap: Record<string, TimelineStage> = {
        order_placed: {
          id: 1,
          label: "Order Placed",
          description: "Your order has been placed and is being processed.",
          icon: Package,
          milestone: "order_placed",
        },
        payment_processed: {
          id: 2,
          label: "Payment Processed",
          description: "Payment has been confirmed.",
          icon: CheckCircle,
          milestone: "payment_processed",
        },
        item_packaged: {
          id: 2,
          label: "Item Packaged",
          description: "Curator is getting your item ready.",
          icon: Package,
          milestone: "item_packaged",
        },
        in_transit: {
          id: 3,
          label: "In Transit",
          description: "Item is on the way via delivery partner.",
          icon: Truck,
          milestone: "in_transit",
        },
        delivered: {
          id: 4,
          label: "Delivered",
          description: "Item has arrived and delivery is confirmed.",
          icon: Home,
          milestone: "delivered",
        },
        rental_active: {
          id: 4,
          label: "Rental Active",
          description: "You can now enjoy your rental.",
          icon: Home,
          milestone: "rental_active",
        },
        return_collected: {
          id: 5,
          label: "Return Collected",
          description: "Item has been picked up, awaiting curator approval.",
          icon: RefreshCw,
          milestone: "return_collected",
        },
        completed: {
          id: 6,
          label: "Completed",
          description: "Curator confirmed return, transaction closed.",
          icon: CheckCircle,
          milestone: "completed",
        },
      };

      return milestoneMap[item.milestone] || null;
    };

    return data.timeline
      .map(mapMilestoneToStage)
      .filter((stage): stage is TimelineStage => stage !== null);
  };

  const stages = getBuildStages();

  // Determine the active state for each line/icon
  const isActive = (stageId: number) => stageId === currentStageId;
  const isCompleted = (stageId: number) => stageId < currentStageId;

  return (
    <div className="p-6 bg-white border border-gray-300 rounded-xl">
      <Paragraph1 className="text-xl font-bold text-gray-900 mb-6">
        Progress ({data.percentComplete || 0}%)
      </Paragraph1>

      {/* Progress Bar */}
      {data.percentComplete !== undefined && (
        <div className="mb-6 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-black h-full transition-all duration-500"
            style={{ width: `${data.percentComplete}%` }}
          ></div>
        </div>
      )}

      {/* Vertical Timeline Container */}
      <div className="relative border-l-2 border-gray-200 pl-8">
        {/* Simulated Thermometer/Progress Icon at the top */}
        <div className="absolute top-0 -left-4">
          <Thermometer
            size={24}
            className="text-gray-900 bg-white p-1 rounded-full border border-gray-200"
          />
        </div>

        {stages.map((stage) => {
          const active = isActive(stage.id);
          const completed = isCompleted(stage.id);
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="mb-8 relative">
              {/* Icon / Bullet Point */}
              <div
                className={`absolute -left-12 top-0 w-8 h-8 rounded-full flex items-center justify-center 
                                ${
                                  active
                                    ? "bg-black text-white"
                                    : completed
                                      ? "bg-green-500 text-white"
                                      : "bg-gray-200 text-gray-500"
                                }`}
              >
                {active && <Loader size={16} className="animate-spin" />}
                {!active && <Icon size={16} />}
              </div>

              {/* Content */}
              <div className="ml-0">
                <Paragraph1
                  className={`text-base font-semibold ${
                    active
                      ? "text-black"
                      : completed
                        ? "text-gray-800"
                        : "text-gray-500"
                  }`}
                >
                  {stage.label}
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-600 mt-1">
                  {stage.description}
                </Paragraph1>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
