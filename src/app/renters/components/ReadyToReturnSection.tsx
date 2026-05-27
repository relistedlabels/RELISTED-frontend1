"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Truck, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import ReadyToReturnModal from "./ReadyToReturnModal";
import { useInitiateReturn } from "@/lib/queries/renters/useInitiateReturn";
import {
  ReturnPackageItems,
  type ReturnPackageItem,
} from "@/lib/orders/returnPackageItems";

interface ReadyToReturnSectionProps {
  orderId?: string;
  shipmentId?: string;
  listerLabel?: string | null;
  windowSummary?: string | null;
  existingRequestStatus?: string | null;
  items?: ReturnPackageItem[];
}

const ReadyToReturnSection: React.FC<ReadyToReturnSectionProps> = ({
  orderId,
  shipmentId,
  listerLabel,
  windowSummary,
  existingRequestStatus,
  items = [],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initiateReturnMutation = useInitiateReturn();

  const alreadySubmitted =
    !!existingRequestStatus &&
    existingRequestStatus !== "REJECTED";

  const handleReturnConfirm = async (
    images: string[],
    itemCondition: "GOOD" | "FAIR" | "POOR",
    damageNotes: string,
  ): Promise<void> => {
    if (!orderId) {
      setErrorMessage("Order ID not found");
      throw new Error("Order ID not found");
    }

    try {
      setErrorMessage(null);
      await initiateReturnMutation.mutateAsync({
        orderId,
        shipmentId,
        images,
        itemCondition,
        damageNotes,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to initiate return";
      setErrorMessage(message);
      throw error;
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setErrorMessage(null);
  };

  if (alreadySubmitted) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
        <CheckCircle size={18} className="mt-0.5 flex-shrink-0 text-green-600" />
        <div>
          <Paragraph1 className="text-sm font-semibold text-green-900">
            Return submitted
            {listerLabel ? ` to ${listerLabel}` : ""}
          </Paragraph1>
          <Paragraph2 className="mt-0.5 text-xs text-green-800">
            Pickup is scheduled. You can start another return when another item
            is due.
          </Paragraph2>
          <ReturnPackageItems items={items} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div>
          <Paragraph1 className="font-bold text-gray-900">
            Ready to Return?
            {listerLabel ? ` (${listerLabel})` : ""}
          </Paragraph1>
          <Paragraph1 className="mt-1 text-gray-600">
            Return the item(s) below when you&apos;re finished with the rental
          </Paragraph1>
          <ReturnPackageItems items={items} />
          {windowSummary ? (
            <Paragraph2 className="mt-1 text-xs text-gray-500">
              Pickup window: {windowSummary}
            </Paragraph2>
          ) : null}
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
            <AlertCircle
              size={16}
              className="mt-0.5 flex-shrink-0 text-red-600"
            />
            <Paragraph1 className="text-sm text-red-700">{errorMessage}</Paragraph1>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-lg border border-gray-200 p-4 transition hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 rounded-lg bg-blue-50 p-2">
                <Truck className="text-blue-600" size={20} />
              </div>
              <div>
                <Paragraph1 className="text-sm font-semibold text-gray-900">
                  Easy Pickup
                </Paragraph1>
                <Paragraph1 className="mt-0.5 text-xs text-gray-600">
                  Schedule your pickup in seconds
                </Paragraph1>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 transition hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 rounded-lg bg-amber-50 p-2">
                <Clock className="text-amber-600" size={20} />
              </div>
              <div>
                <Paragraph1 className="text-sm font-semibold text-gray-900">
                  Return on Time
                </Paragraph1>
                <Paragraph1 className="mt-0.5 text-xs text-gray-600">
                  Late returns attract extra rental charges
                </Paragraph1>
              </div>
            </div>
          </div>
        </div>

        <motion.button
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={initiateReturnMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          <Truck size={18} />
          {initiateReturnMutation.isPending
            ? "Processing..."
            : "Start Return Process"}
        </motion.button>
      </div>

      <ReadyToReturnModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleReturnConfirm}
        isLoading={initiateReturnMutation.isPending}
        orderId={orderId}
      />
    </>
  );
};

export default ReadyToReturnSection;
