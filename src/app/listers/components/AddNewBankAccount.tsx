"use client";
// ENDPOINTS: POST /api/listers/wallet/bank-accounts (add new bank account), GET /api/banks (list of banks)

import React, { useState } from "react";
import {
  SlidersVertical,
  X,
  Search,
  ChevronLeft,
  ArrowLeft,
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
import WalletTopUpForm from "@/app/shop/cart/checkout/components/WalletTopUpForm";
import { FaPlus } from "react-icons/fa";
import AddNewBankAccountForm from "./AddNewBankAccountForm";

// --------------------
// Slide-in Filter Panel
// --------------------
interface AddNewBankAccountPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddNewBankAccountPanel: React.FC<AddNewBankAccountPanelProps> = ({
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
            aria-label="Product AddNewBankAccount"
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
                aria-label="Close AddNewBankAccount"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className={slidePanelTitle}>
                Add bank account
              </Paragraph1>
              <button
                onClick={onClose}
                className="text-gray-500  hover:text-black p-1 rounded-full transition"
                aria-label="Close AddNewBankAccount"
              >
                <X className=" hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="grow pt-4 pb-20 space-y-8">
              <AddNewBankAccountForm />{" "}
            </div>

            {/* Footer */}
            <div className={`${slidePanelFooter} flex gap-3`}>
              <button type="button" onClick={onClose} className={`${buttonSecondary} flex-1`}>
                Cancel
              </button>

              <button type="button" className={`${buttonPrimary} flex-1`}>
                Proceed
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
const AddNewBankAccount: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}

      <button
        onClick={() => setIsOpen(true)}
        className="w-full text-left p-3 flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition duration-150"
      >
        <FaPlus className="w-3 h-3 text-gray-600" />
        <Paragraph1>Add New Bank Account</Paragraph1>
      </button>

      {/* Filter Panel */}
      <AddNewBankAccountPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default AddNewBankAccount;
export { AddNewBankAccountPanel };
