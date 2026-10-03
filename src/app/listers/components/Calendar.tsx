"use client";

import React, { useState } from "react";
import {
  SlidersVertical,
  X,
  Search,
  ChevronLeft,
  ArrowLeft,
  Calendar1,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { buttonPrimaryFull } from "@/common/ui/buttonClasses";
import {
  slidePanelBackdrop,
  slidePanelFooter,
  slidePanelHeader,
  slidePanelSheet,
  slidePanelTitle,
} from "@/common/ui/dashboardClasses";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import WalletTopUpForm from "@/app/shop/cart/checkout/components/WalletTopUpForm";
import { FaPlus } from "react-icons/fa";
import { HiOutlineArrowDownRight } from "react-icons/hi2";
import RentalCalendar from "./RentalCalendar";

// --------------------
// Slide-in Filter Panel
// --------------------
interface CalendarPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CalendarPanel: React.FC<CalendarPanelProps> = ({ isOpen, onClose }) => {
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
            aria-label="Product Calendar"
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
                aria-label="Close Calendar"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className={slidePanelTitle}>Calendar</Paragraph1>
              <button
                onClick={onClose}
                className="text-gray-500  hover:text-black p-1 rounded-full transition"
                aria-label="Close Calendar"
              >
                <X className=" hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="grow pt-4 pb-20 space-y-8">
              <RentalCalendar />{" "}
            </div>

            {/* Footer */}
            <div className={slidePanelFooter}>
              <button type="button" onClick={onClose} className={buttonPrimaryFull}>
                Done
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
const Calendar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}

      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-1 text-gray-600 hover:text-black transition"
      >
        <Calendar1 className="w-4 h-4" />
        <Paragraph1 className="text-sm font-medium underline">
          Calendar
        </Paragraph1>
      </button>

      {/* Filter Panel */}
      <CalendarPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default Calendar;
