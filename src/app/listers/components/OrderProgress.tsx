"use client";

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

const steps = [
  { label: "Approved", icon: CheckCircle2 },
  { label: "Dispatched", icon: Package },
  { label: "In Transit", icon: Truck },
  { label: "Delivered", icon: Home },
  { label: "Return Due", icon: RotateCcw },
  { label: "Completed", icon: Check },
];

const OrderProgress: React.FC<{ currentStep?: number }> = ({
  currentStep = 0,
}) => {
  return (
    <div className="w-full bg-white border border-gray-300 rounded-2xl p-4 ">
      <Paragraph1 className="text-xl font-bold uppercase text-black mb-4">Order Progress</Paragraph1>

      <div className="relative flex justify-between">
        {/* Background Line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 z-0" />

        {/* Animated Active Line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          className="absolute top-5 left-0 h-0.5 bg-black z-0"
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        {steps.map((step, index) => {
          const isActive = index <= currentStep;
          const Icon = step.icon;

          return (
            <div
              key={step.label}
              className="relative z- flex flex-col items-center"
            >
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isActive ? "#000" : "#F6F6F6",
                  color: isActive ? "#FFF" : "#A1A1A1",
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm"
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
