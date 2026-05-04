"use client";
// ENDPOINTS: GET /api/listers/orders/:orderId/progress (current order status/step)

import React from "react";
import { motion } from "framer-motion";
import {
  Check,
  Package,
  Truck,
  Home,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  isListerResaleOrder,
  isResaleItem,
} from "@/lib/listers/listerOrderRow";

const rentalSteps = [
  { label: "Pending", icon: CheckCircle2 },
  { label: "Approved", icon: CheckCircle2 },
  { label: "Dispatched", icon: Truck },
  { label: "In transit", icon: Package },
  { label: "Delivered", icon: Home },
  { label: "Awaiting return", icon: RotateCcw },
  { label: "Return received", icon: CheckCircle2 },
  { label: "Completed", icon: Check },
];

const resaleSteps = [
  { label: "Pending", icon: CheckCircle2 },
  { label: "Approved", icon: CheckCircle2 },
  { label: "In Transit", icon: Truck },
  { label: "Delivered", icon: Home },
  { label: "Completed", icon: Check },
];

interface OrderProgressProps {
  currentStep?: number;
  orderData?: any;
  clickedItem?: any;
}

const OrderProgress: React.FC<OrderProgressProps> = ({
  currentStep: propCurrentStep = 0,
  orderData,
  clickedItem,
}) => {
  // Check if the clicked item or order is resale
  const isResale = isResaleItem(clickedItem) || isListerResaleOrder(orderData);
  const steps = isResale ? resaleSteps : rentalSteps;

  // Map API order / timeline status → step index (timeline uses lowercase API slugs e.g. intransit, confirmed).
  let currentStep = propCurrentStep;
  if (orderData) {
    const raw = String(
      orderData.timeline?.currentStep ?? orderData.status ?? "",
    )
      .toLowerCase()
      .replace(/-/g, "_");

    if (isResale) {
      const resaleByApi: Record<string, number> = {
        processing: 0,
        accepted: 1,
        confirmed: 1,
        intransit: 2,
        delivered: 3,
        active: 3,
        completed: 4,
        returned: 4,
        return_due: 4,
        in_dispute: 2,
        cancelled: 0,
        rejected: 0,
      };
      const idx = resaleByApi[raw];
      if (idx !== undefined) currentStep = idx;
    } else {
      const rentalByApi: Record<string, number> = {
        processing: 0,
        accepted: 1,
        confirmed: 2,
        intransit: 3,
        delivered: 4,
        active: 4,
        return_due: 5,
        returned: 6,
        completed: 7,
        in_dispute: 4,
        cancelled: 0,
        rejected: 0,
      };
      const idx = rentalByApi[raw];
      if (idx !== undefined) currentStep = idx;
    }
  }
  return (
    <div className="bg-white p-4 border border-gray-300 rounded-2xl w-full">
      <Paragraph1 className="mb-4 font-bold text-black text-xl uppercase">
        Order Progress
      </Paragraph1>

      <div className="relative flex justify-between">
        {/* Background Line */}
        <div className="top-5 left-0 z-0 absolute bg-gray-100 w-full h-0.5" />

        {/* Animated Active Line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          className="top-5 left-0 z-0 absolute bg-black h-0.5"
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        {steps.map((step, index) => {
          const isActive = index <= currentStep;
          const Icon = step.icon;

          return (
            <div
              key={`${step.label}-${index}`}
              className="z- relative flex flex-col items-center"
            >
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isActive ? "#000" : "#F6F6F6",
                  color: isActive ? "#FFF" : "#A1A1A1",
                }}
                className="flex justify-center items-center shadow-sm border-4 border-white rounded-full w-10 h-10"
              >
                <Icon className="w-5 h-5" />
              </motion.div>

              <span
                className={`mt-3 text-[9px] font-bold transition-colors ${
                  isActive ? "text-black" : "text-gray-300"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderProgress;
