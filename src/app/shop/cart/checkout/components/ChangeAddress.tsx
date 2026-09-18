"use client";

import React, { useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1 } from "@/common/ui/Text";
import {
  slidePanelBackdrop,
  slidePanelHeader,
  slidePanelSheet,
  slidePanelTitle,
} from "@/common/ui/dashboardClasses";
import AddressInputForm from "./AddressInputForm";
// --------------------
// Slide-in Address Modal
// --------------------
interface ChangeAddressPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSaved?: () => void;
  panelTitle?: string;
}

const ChangeAddressPanel: React.FC<ChangeAddressPanelProps> = ({
  isOpen,
  onClose,
  onAddressSaved,
  panelTitle = "Update address",
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
            aria-label={panelTitle}
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
                aria-label="Close address modal"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className={slidePanelTitle}>{panelTitle}</Paragraph1>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-black p-1 rounded-full transition"
                aria-label="Close address modal"
              >
                <X className="hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="grow pt-4 pb-20">
              <AddressInputForm
                onAddressSaved={onAddressSaved}
                onClose={onClose}
              />
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
interface ChangeAddressProps {
  onAddressSaved?: () => void;
  buttonLabel?: string;
  panelTitle?: string;
}

const ChangeAddress: React.FC<ChangeAddressProps> = ({
  onAddressSaved,
  buttonLabel = "Update address",
  panelTitle = "Update address",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="border px-4 items-center rounded-lg bg-black text-white justify-center w-fit py-2 flex gap-1 cursor-pointer font-semibold hover:bg-gray-900 text-sm transition"
      >
        <Paragraph1>{buttonLabel}</Paragraph1>
      </button>

      <ChangeAddressPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onAddressSaved={onAddressSaved}
        panelTitle={panelTitle}
      />
    </>
  );
};

export default ChangeAddress;
