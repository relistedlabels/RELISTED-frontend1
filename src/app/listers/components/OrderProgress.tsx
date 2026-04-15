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
  { label: "In Transit", icon: Truck },
  { label: "Delivered", icon: Home },
  { label: "Return Due", icon: RotateCcw },
  { label: "Return Transit", icon: Truck },
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

  // If orderData is provided, extract the current step
  let currentStep = propCurrentStep;
  if (orderData?.timeline?.currentStep) {
    // Map the step name to index
    const stepIndex = steps.findIndex(
      (s) =>
        s.label.toLowerCase() ===
        (orderData.timeline.currentStep || "").toLowerCase(),
    );
    if (stepIndex !== -1) {
      currentStep = stepIndex;
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
