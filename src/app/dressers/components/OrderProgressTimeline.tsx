"use client";

import React from "react";
// Lucide icons for visual representation
import {
  CheckCircle,
  Package,
  Truck,
  Home,
  RefreshCw,
  Thermometer,
} from "lucide-react";
import {  Paragraph1 } from "@/common/ui/Text";

// --- Configuration for Timeline Stages ---
interface TimelineStage {
  id: number;
  label: string;
  description: string;
  icon: React.ElementType;
}

const orderStages: TimelineStage[] = [
  {
    id: 1,
    label: "Order Placed",
    description: "Your order has been placed and is being processed.",
    icon: Package,
  },
  {
    id: 2,
    label: "Preparing Order",
    description: "Curator is getting your item ready.",
    icon: Package,
  }, // Used Package as a general basket/prepare icon
  {
    id: 3,
    label: "In Transit",
    description: "Item is on the way via delivery partner.",
    icon: Truck,
  },
  {
    id: 4,
    label: "Delivered",
    description: "Item has arrived and delivery is confirmed.",
    icon: Home,
  },
  {
    id: 5,
    label: "Returned – Pending Review",
    description: "Item has been picked up, awaiting curator approval.",
    icon: RefreshCw,
  },
  {
    id: 6,
    label: "Completed",
    description: "Curator confirmed return, transaction closed.",
    icon: CheckCircle,
  },
];

// --- Main Component ---

interface OrderProgressTimelineProps {
  // Current stage ID (1 to 6). Determines which stage is highlighted/active.
  currentStageId?: number;
}

export default function OrderProgressTimeline({
  currentStageId = 3,
}: OrderProgressTimelineProps) {
  // Determine the active state for each line/icon
  const isActive = (stageId: number) => stageId === currentStageId;
  const isCompleted = (stageId: number) => stageId < currentStageId;

  return (
    <div className="p-6 bg-white border border-gray-300 rounded-xl">
      <Paragraph1 className="text-xl font-bold text-gray-900 mb-6">
        Progress
      </Paragraph1>

      {/* Vertical Timeline Container */}
      <div className="relative border-l-2 border-gray-200 pl-8">
        {/* Simulated Thermometer/Progress Icon at the top */}
        <div className="absolute top-0 -left-4">
          <Thermometer
            size={24}
            className="text-gray-900 bg-white p-1 rounded-full border border-gray-200"
          />
        </div>

        {orderStages.map((stage) => {
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
                <Icon size={16} />
              </div>

              {/* Connector Line (Visually handled by the border-l-2 on the parent div) 
                                Note: The border-l on the parent element is used to create the main vertical line.
                            */}

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
