"use client";
// ENDPOINTS: GET /api/listers/disputes/:disputeId, POST /api/listers/disputes/:disputeId/withdraw

import React, { useState } from "react";
import {
  SlidersVertical,
  X,
  Search,
  ChevronLeft,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { buttonPrimary } from "@/common/ui/buttonClasses";
import {
  slidePanelBackdrop,
  slidePanelFooter,
  slidePanelHeader,
  slidePanelSheet,
  slidePanelTitle,
} from "@/common/ui/dashboardClasses";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import ProductCuratorDetails from "./ProductCuratorDetails";
import OrderProgressTimeline from "./OrderProgressTimeline";
import OrderStatusDetails from "./OrderStatusDetails";
import ExampleDisputeDetail from "./DisputeDetailTabs";
import { useDisputeDetail } from "@/lib/queries/listers";
import { useWithdrawDispute } from "@/lib/mutations/listers";
import ExampleDisputeOverview from "./DisputeOverviewContent";

// --------------------
// Slide-in Filter Panel
// --------------------
interface DisputeDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  disputeId?: string;
}

const DisputeDetailsPanel: React.FC<DisputeDetailsPanelProps> = ({
  isOpen,
  onClose,
  disputeId,
}) => {
  const minPrice = 50000;
  const maxPrice = 200000;

  const variants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  const { data: disputeDetail } = useDisputeDetail(disputeId);
  const withdrawMutation = useWithdrawDispute(disputeId || "");

  const statusLabel = disputeDetail?.data.dispute.statusLabel || "In Review";

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
                className="text-gray-500 xl:hidden hover:text-black p-1 rounded-full transition"
                aria-label="Close DisputeDetails"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className={slidePanelTitle}>
                Dispute #{disputeDetail?.data.dispute.disputeId || disputeId || "---"}
              </Paragraph1>
              <button
                onClick={onClose}
                className="text-gray-500  hover:text-black p-1 rounded-full transition"
                aria-label="Close DisputeDetails"
              >
                <X className=" hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="grow pt-4 pb-20 space-y-8">
              {disputeId && <ExampleDisputeDetail disputeId={disputeId} />}
            </div>

            {/* Footer */}
            <div className={`${slidePanelFooter} flex gap-3`}>
              <button
                type="button"
                disabled={withdrawMutation.isPending || !disputeId}
                onClick={() => disputeId && withdrawMutation.mutate()}
                className="flex-1 rounded-lg border border-red-500 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {withdrawMutation.isPending
                  ? "Withdrawing..."
                  : "Withdraw Dispute"}
              </button>

              <button type="button" onClick={onClose} className={`${buttonPrimary} flex-1`}>
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
interface DisputeDetailsProps {
  disputeId?: string;
}

const DisputeDetails: React.FC<DisputeDetailsProps> = ({ disputeId }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        <ChevronRight className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
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
