// ENDPOINTS: GET /api/renters/disputes/:disputeId

"use client";

import React, { useState } from "react";
import {
  SlidersVertical,
  X,
  Search,
  ChevronLeft,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import ProductCuratorDetails from "./ProductCuratorDetails";
import OrderProgressTimeline from "./OrderProgressTimeline";
import OrderStatusDetails from "./OrderStatusDetails";
import ExampleDisputeDetail from "./DisputeDetailTabs";
import ExampleDisputeOverview from "./DisputeOverviewContent";

// --------------------
// Slide-in Filter Panel
// --------------------
interface DisputeDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const DisputeDetailsPanel: React.FC<DisputeDetailsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const minPrice = 50000;
  const maxPrice = 200000;

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
            aria-label="Product DisputeDetails"
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
                aria-label="Close DisputeDetails"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className=" font-bold uppercase tracking-widest text-gray-800">
                Dispute #DQ-0234{" "}
              </Paragraph1>
              <button
                onClick={onClose}
                className="text-gray-500  hover:text-black p-1 rounded-full transition"
                aria-label="Close DisputeDetails"
              >
                <X className=" hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="grow pt-4 pb-20 space-y-8">
              <ExampleDisputeDetail />
            </div>

            {/* Footer */}
            <div className="mt-auto py-2 bg-white flex justify-between gap-4 sticky bottom-0">
              <button className="flex-1  px-4 py-3 text-sm font-semibold border border-red-500 text-red-500 rounded-lg hover:bg-gray-50 transition">
                <Paragraph1>Withdraw Dispute </Paragraph1>
              </button>

              <button
                onClick={onClose}
                className="flex-1  px-4 py-3 text-sm font-semibold border bg-black text-white rounded-lg hover:bg-gray-900 transition"
              >
                <Paragraph1>Close </Paragraph1>
              </button>
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
const DisputeDetails: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        <ChevronRight className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
      </button>

      {/* Filter Panel */}
      <DisputeDetailsPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default DisputeDetails;
