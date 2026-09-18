"use client";

import React, { useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buttonPrimary } from "@/common/ui/buttonClasses";
import {
  slidePanelBackdrop,
  slidePanelHeader,
  slidePanelSheet,
  slidePanelTitle,
} from "@/common/ui/dashboardClasses";
import { Paragraph1 } from "@/common/ui/Text";
import { FaPlus } from "react-icons/fa";
import RaiseDisputeForm from "./RaiseDisputeForm";

// --------------------
// Slide-in Filter Panel
// --------------------
interface RaiseDisputePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const RaiseDisputePanel: React.FC<RaiseDisputePanelProps> = ({
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
            aria-label="Product RaiseDispute"
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
                className="xl:hidden p-1 rounded-full text-gray-500 hover:text-black transition"
                aria-label="Close RaiseDispute"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className={slidePanelTitle}>Raise a dispute</Paragraph1>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-500 hover:text-black transition"
                aria-label="Close RaiseDispute"
              >
                <X className="hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-8 pt-4 pb-20 grow">
              <RaiseDisputeForm onSuccess={onClose} />
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
const RaiseDispute: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`${buttonPrimary} whitespace-nowrap shadow-sm`}
      >
        <FaPlus className="h-3.5 w-3.5" aria-hidden />
        Raise new dispute
      </button>

      {/* Filter Panel */}
      <RaiseDisputePanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default RaiseDispute;
