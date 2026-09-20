"use client";

import React, { useState } from "react";
import { ArrowLeft, MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1 } from "@/common/ui/Text";
import {
  slidePanelBackdrop,
  slidePanelBody,
  slidePanelHeader,
  slidePanelSheetPinned,
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
            className={slidePanelSheetPinned}
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
            <div className={`${slidePanelBody} pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]`}>
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
  /** Inline text link, full clickable row, or outline button for empty states. */
  variant?: "link" | "outline" | "row";
  addressLine?: string;
}

const ChangeAddress: React.FC<ChangeAddressProps> = ({
  onAddressSaved,
  buttonLabel = "Change",
  panelTitle = "Update address",
  variant = "link",
  addressLine,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openPanel = () => setIsOpen(true);

  const triggerClassName =
    variant === "link"
      ? "shrink-0 whitespace-nowrap text-sm font-semibold text-gray-900 underline-offset-4 hover:underline transition-colors"
      : "shrink-0 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors";

  return (
    <>
      {variant === "row" && addressLine ? (
        <button
          type="button"
          onClick={openPanel}
          aria-label={`${buttonLabel} delivery address`}
          className="flex w-full items-start gap-3.5 bg-gray-50 hover:bg-gray-100 p-4 sm:p-5 rounded-xl text-left transition-colors"
        >
          <MapPin
            size={20}
            className="mt-1 text-gray-500 shrink-0"
            aria-hidden
          />
          <div className="flex flex-1 justify-between items-start gap-4 min-w-0">
            <Paragraph1 className="text-gray-900 text-[15px] leading-relaxed">
              {addressLine}
            </Paragraph1>
            <span className="shrink-0 font-semibold text-gray-900 text-[15px] underline-offset-4">
              {buttonLabel}
            </span>
          </div>
        </button>
      ) : (
        <button type="button" onClick={openPanel} className={triggerClassName}>
          {buttonLabel}
        </button>
      )}

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
