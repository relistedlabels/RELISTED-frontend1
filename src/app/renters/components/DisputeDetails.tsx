// ENDPOINTS: GET /api/renters/disputes/:disputeId

"use client";

import React, { useState } from "react";
import { X, ArrowLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
          className="z-99 fixed inset-0 bg-black/70 backdrop--blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="top-0 right-0 fixed flex flex-col bg-white shadow-2xl px-4 w-full sm:w-114 h-screen overflow-y-auto hide-scrollbar"
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
            <div className="top-0 z-10 sticky flex justify-between items-center bg-white pt-6 pb-4 border-gray-100 border-b">
              <button
                onClick={onClose}
                className="xl:hidden p-1 rounded-full text-gray-500 hover:text-black transition"
                aria-label="Close DisputeDetails"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className="font-bold text-gray-800 uppercase tracking-widest">
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
            <div className="bottom-0 sticky flex justify-between gap-4 bg-white mt-auto py-2">
              <button
                onClick={onClose}
                className="flex-1 bg-black hover:bg-gray-900 px-4 py-3 border rounded-lg font-semibold text-white text-sm transition"
              >
                <Paragraph1>Close </Paragraph1>
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
      <button onClick={() => setIsOpen(true)}>
        <ChevronRight className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
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
