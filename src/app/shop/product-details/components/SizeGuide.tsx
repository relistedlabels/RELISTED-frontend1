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
import { buttonPrimary } from "@/common/ui/buttonClasses";
import {
  slidePanelBackdrop,
  slidePanelFooter,
  slidePanelHeader,
  slidePanelSheet,
  slidePanelTitle,
} from "@/common/ui/dashboardClasses";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import RentalDurationSelector from "./RentalDurationSelector";
import RentalSummaryCard from "./RentalSummaryCard";
import SizeChartTable from "./SizeChartTable";

// --------------------
// Slide-in Filter Panel
// --------------------
interface SizeGuidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SizeGuidePanel: React.FC<SizeGuidePanelProps> = ({ isOpen, onClose }) => {
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
          className={slidePanelBackdrop}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={slidePanelSheet}
            role="dialog"
            aria-modal="true"
            aria-label="Product SizeGuide"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={slidePanelHeader}>
              <button
                onClick={onClose}
                className="text-gray-500 xl:hidden hover:text-black p-1 rounded-full transition"
                aria-label="Close SizeGuide"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className={slidePanelTitle}>Size Guide</Paragraph1>
              <button
                onClick={onClose}
                className="text-gray-500  hover:text-black p-1 rounded-full transition"
                aria-label="Close SizeGuide"
              >
                <X className=" hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="grow pt-4 pb-20 space-y-8">
              <SizeChartTable />
            </div>

            {/* Footer */}
            <div className={slidePanelFooter}>
              <button type="button" onClick={onClose} className={`${buttonPrimary} w-full`}>
                <Paragraph1>Done </Paragraph1>
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
const SizeGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="border-b border-gray-400 px-4 items-center   justify-center  w-fit py- flex gap-1 cursor-pointer  transition "
      >
        <Paragraph1> Size Guide</Paragraph1>
      </button>

      {/* Filter Panel */}
      <SizeGuidePanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default SizeGuide;
