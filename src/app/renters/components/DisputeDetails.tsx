// ENDPOINTS: GET /api/renters/disputes/:disputeId

"use client";

import React, { useState } from "react";
import { X, ArrowLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buttonPrimaryFull } from "@/common/ui/buttonClasses";
import {
  slidePanelBackdrop,
  slidePanelFooter,
  slidePanelHeader,
  slidePanelSheet,
  slidePanelTitle,
} from "@/common/ui/dashboardClasses";
import { Paragraph1 } from "@/common/ui/Text";
import DisputeDetail from "./DisputeDetailTabs";
import { useDisputeDetails } from "@/lib/queries/renters/useDisputes";

// --------------------
// Slide-in Filter Panel
// --------------------
interface DisputeDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  disputeId: string;
}

const DisputeDetailsPanel: React.FC<DisputeDetailsPanelProps> = ({
  isOpen,
  onClose,
  disputeId,
}) => {
  const variants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };
  const { data: dispute } = useDisputeDetails(disputeId);

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
            aria-label="Product DisputeDetails"
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
                aria-label="Close DisputeDetails"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className={slidePanelTitle}>
                Dispute #{dispute?.disputeId || disputeId}
              </Paragraph1>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-500 hover:text-black transition"
                aria-label="Close DisputeDetails"
              >
                <X className="hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-8 pt-4 pb-20 grow">
              <DisputeDetail disputeId={disputeId} />
            </div>

            {/* Footer */}
            <div className={slidePanelFooter}>
              <button type="button" onClick={onClose} className={buttonPrimaryFull}>
                Close
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
const DisputeDetails: React.FC<{ disputeId: string }> = ({ disputeId }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        aria-label="View dispute details"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Filter Panel */}
      <DisputeDetailsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        disputeId={disputeId}
      />
    </>
  );
};

export default DisputeDetails;
