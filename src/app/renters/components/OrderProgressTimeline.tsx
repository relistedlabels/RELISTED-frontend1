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
  orderData?: any;
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
  orderData,
}: OrderProgressTimelineProps) {
  const [currentStageId, setCurrentStageId] = useState(1);
  const percentComplete = 50;

  // Status to stage mapping based on order status
  const statusToStageId: Record<string, number> = {
    active: 4,
    completed: 6,
    cancelled: 1,
    disputed: 3,
  };

  useEffect(() => {
    if (orderData?.status) {
      const stageId = statusToStageId[orderData.status] || 1;
      setCurrentStageId(stageId);
    }
  }, [orderData?.status]);

  if (!orderData) {
    return (
      <div className="p-6 bg-white border border-gray-300 rounded-xl">
        <Paragraph1 className="text-gray-600">
          No progress data available.
        </Paragraph1>
      </div>
    );
  }

  // Define timeline stages
  const stages: TimelineStage[] = [
    {
      id: 1,
      label: "Order Placed",
      description: "Your order has been placed and is being processed.",
      icon: Package,
      milestone: "order_placed",
    },
    {
      id: 2,
      label: "Confirmed",
      description: "Lister confirmed and is preparing the item.",
      icon: CheckCircle,
      milestone: "processing",
    },
    {
      id: 3,
      label: "In Transit",
      description: "Item is on the way via delivery partner.",
      icon: Truck,
      milestone: "in_transit",
    },
    {
      id: 4,
      label: "Delivered",
      description: "Item has arrived and delivery is confirmed.",
      icon: Home,
      milestone: "delivered",
    },
    {
      id: 5,
      label: "Return Initiated",
      description: "Item return has been initiated.",
      icon: RefreshCw,
      milestone: "return_initiated",
    },
    {
      id: 6,
      label: "Completed",
      description: "Lister confirmed return, transaction closed.",
      icon: CheckCircle,
      milestone: "completed",
    },
  ];

  // Determine the active state for each line/icon
  const isActive = (stageId: number) => stageId === currentStageId;
  const isCompleted = (stageId: number) => stageId < currentStageId;

  return (
    <div className="p-6 bg-white border border-gray-300 rounded-xl">
      <Paragraph1 className="text-xl font-bold text-gray-900 mb-6">
        Progress ({percentComplete}%)
      </Paragraph1>

      {/* Progress Bar */}
      <div className="mb-6 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-black h-full transition-all duration-500"
          style={{ width: `${percentComplete}%` }}
        ></div>
      </div>

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
