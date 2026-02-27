"use client";

import React, { useState } from "react";
import {
  SlidersVertical,
  X,
  Search,
  ChevronLeft,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import RentalDurationSelector from "./RentalDurationSelector";
import RentalSummaryCard from "./RentalSummaryCard";
import RentalCartView from "../../cart/components/RentalCartView";
import { useMe } from "@/lib/queries/auth/useMe";

// --------------------
// Types
// --------------------
type FilterItemProps = {
  label: string;
  type?: "radio" | "checkbox";
};

// --------------------
// Slide-in Filter Panel
// --------------------
interface RentalPeriodsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  listerId: string;
  dailyPrice: number;
  securityDeposit: number;
}

const RentalPeriodsPanel: React.FC<RentalPeriodsPanelProps> = ({
  isOpen,
  onClose,
  productId,
  listerId,
  dailyPrice,
  securityDeposit,
}) => {
  const minPrice = 50000;
  const maxPrice = 200000;
  const { data: user } = useMe();

  const variants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  const ExampleData = {
    rentalDays: 3,
    rentalFeePerPeriod: 165000,
    securityDeposit: 15000,
    cleaningFee: 10000,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-99 bg-black/70 backdrop--blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed top-0 right-0 h-screen hide-scrollbar overflow-y-auto bg-white shadow-2xl px-4  flex flex-col w-full sm:w-114"
            role="dialog"
            aria-modal="true"
            aria-label="Product RentalPeriods"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between sticky top-0 items-center pb-4 border-b border-gray-100 pt-6 z-10  bg-white">
              <button
                onClick={onClose}
                className="text-gray-500 xl:hidden hover:text-black p-1 rounded-full transition"
                aria-label="Close RentalPeriods"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className=" font-bold tracking-widest text-gray-800">
                CHOOSE RENTAL PERIOD
              </Paragraph1>
              <button
                onClick={onClose}
                className="text-gray-500  hover:text-black p-1 rounded-full transition"
                aria-label="Close RentalPeriods"
              >
                <X className=" hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="grow pt-4 pb-20 space-y-8">
              <RentalDurationSelector
                productId={productId}
                listerId={listerId}
                dailyPrice={dailyPrice}
                securityDeposit={securityDeposit}
              />
              <RentalSummaryCard {...ExampleData} />
            </div>

            {/* Footer */}
            <div className="mt-auto py-2 bg-white flex justify-between gap-4 sticky bottom-0">
              <button className="flex-1  px-4 py-3 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <Paragraph1>Cancel </Paragraph1>
              </button>

              <RentalCartView />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --------------------
// Main Component
// --------------------

interface RentalPeriodsProps {
  productId: string;
  listerId: string;
  dailyPrice: number;
  securityDeposit: number;
}

const RentalPeriods: React.FC<RentalPeriodsProps> = ({
  productId,
  listerId,
  dailyPrice,
  securityDeposit,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: user } = useMe();

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => {
          if (!user) {
            // Capture current page URL
            const currentUrl = encodeURIComponent(window.location.href);
            window.location.href = `/auth/sign-in?redirect=${currentUrl}`;
            return;
          }
          setIsOpen(true);
        }}
        className="border px-4 items-center rounded-lg bg-black text-white justify-center w-full py-2 flex gap-1 cursor-pointer font-semibold hover:text-black text-sm border-black hover:bg-gray-100 transition"
      >
        <Paragraph1>Rent now</Paragraph1>
      </button>

      {/* Filter Panel */}
      <RentalPeriodsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productId={productId}
        listerId={listerId}
        dailyPrice={dailyPrice}
        securityDeposit={securityDeposit}
      />
    </>
  );
};

export default RentalPeriods;
