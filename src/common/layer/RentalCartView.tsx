"use client";

import React, { useState } from "react";
import {
  SlidersVertical,
  X,
  Search,
  ChevronLeft,
  ArrowLeft,
  ShoppingBagIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buttonPrimary, buttonSecondary } from "@/common/ui/buttonClasses";
import {
  slidePanelBackdrop,
  slidePanelFooter,
  slidePanelHeader,
  slidePanelSheet,
  slidePanelTitle,
} from "@/common/ui/dashboardClasses";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import Link from "next/link";
import RentalCartSummary from "@/app/shop/cart/components/RentalCartSummary";

// --------------------
// Slide-in Filter Panel
// --------------------
interface RentalCartViewPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const RentalCartViewPanel: React.FC<RentalCartViewPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const minPrice = 50000;
  const maxPrice = 200000;

  const variants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
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
            aria-label="Product RentalCartView"
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
                aria-label="Close RentalCartView"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className={slidePanelTitle}>Your Cart </Paragraph1>
              <button
                onClick={onClose}
                className="text-gray-500  hover:text-black p-1 rounded-full transition"
                aria-label="Close RentalCartView"
              >
                <X className=" hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="grow pt-4 pb-20 space-y-8">
              <RentalCartSummary />
            </div>

            {/* Footer */}
            <div className={`${slidePanelFooter} flex flex-col gap-4`}>
              <Link
                onClick={onClose}
                href="/shop/cart"
                className={`${buttonSecondary} w-full`}
              >
                <Paragraph1>View Cart </Paragraph1>
              </Link>

              <button type="button" onClick={onClose} className={`${buttonPrimary} w-full`}>
                <Paragraph1>Continue Shopping</Paragraph1>
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
const RentalCartView: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex rounded-lg whitespace-nowrap bg-black text-white  items-center  gap-1 cursor-pointer  transition "
      >
        <ShoppingBagIcon className="w-6 h-6" /> <Paragraph1> 0</Paragraph1>
      </button>

      {/* Filter Panel */}
      <RentalCartViewPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default RentalCartView;
