"use client";

import React, { useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buttonPrimary, buttonSecondary } from "@/common/ui/buttonClasses";
import {
  slidePanelBackdrop,
  slidePanelFooter,
  slidePanelHeader,
  slidePanelSheet,
  slidePanelTitle,
} from "@/common/ui/dashboardClasses";
import { Paragraph1 } from "@/common/ui/Text";
import RentalCartSummary from "./RentalCartSummary";
import { useCart } from "@/lib/queries/renters/useCart";
import Link from "next/link";

// --------------------
// Slide-in Cart Panel
// --------------------
interface RentalCartViewPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const RentalCartViewPanel: React.FC<RentalCartViewPanelProps> = ({
  isOpen,
  onClose,
}) => {
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
            aria-label="Shopping Cart"
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
                aria-label="Close cart"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className={slidePanelTitle}>Your Cart</Paragraph1>
              <button
                onClick={onClose}
                className="text-gray-500  hover:text-black p-1 rounded-full transition"
                aria-label="Close cart"
              >
                <X className=" hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="grow pt-4 pb-20 space-y-8">
              {/* Optionally pass cartItems to RentalCartSummary if needed */}
              <RentalCartSummary />
            </div>

            {/* Footer */}
            <div className={`${slidePanelFooter} flex flex-col gap-4`}>
              <Link href="/shop/cart" className={`${buttonSecondary} w-full`}>
                <Paragraph1>View Full Cart </Paragraph1>
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
        className="border flex-1 rounded-lg bg-black text-white px-4 items-center   justify-center  w-full py- flex gap-1 cursor-pointer  transition "
      >
        <Paragraph1> View cart</Paragraph1>
      </button>

      {/* Filter Panel */}
      <RentalCartViewPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default RentalCartView;
