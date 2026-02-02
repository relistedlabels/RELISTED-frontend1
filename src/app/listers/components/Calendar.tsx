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
            aria-label="Product Calendar"
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
                aria-label="Close Calendar"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className=" uppercase font-bold tracking-widest text-gray-800">
                Calendar 
              </Paragraph1>
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
            <div className="mt-auto py-2 text-black bg-white flex justify-between gap-4 sticky bottom-0">
              {/* <button className="flex-1  px-4 py-3  font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <Paragraph1>Cancel </Paragraph1>
              </button> */}

              <button className="flex w-full  px-4 py-3 justify-center  font-semibold border bg-black/80 text-white rounded-lg hover:bg-gray-900 transition">
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
