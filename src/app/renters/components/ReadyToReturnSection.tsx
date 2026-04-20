"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Truck, Clock, AlertCircle } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import ReadyToReturnModal from "./ReadyToReturnModal";
import { useInitiateReturn } from "@/lib/queries/renters/useInitiateReturn";

interface ReadyToReturnSectionProps {
  orderId?: string;
  orderData?: any;
}

const ReadyToReturnSection: React.FC<ReadyToReturnSectionProps> = ({
  orderId,
  orderData,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initiateReturnMutation = useInitiateReturn();

  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );

  const findRentalUuid = (
    value: unknown,
    pathHasRental: boolean,
  ): string | undefined => {
    if (!value || typeof value !== "object") return undefined;
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = findRentalUuid(item, pathHasRental);
        if (found) return found;
      }
      return undefined;
    }

    for (const [key, val] of Object.entries(value)) {
      const lowerKey = key.toLowerCase();
      const nextPathHasRental = pathHasRental || lowerKey.includes("rental");

      if (typeof val === "string" && isUuid(val)) {
        if (lowerKey.includes("rental") || (nextPathHasRental && lowerKey === "id")) {
          return val;
        }
      }

      const found = findRentalUuid(val, nextPathHasRental);
      if (found) return found;
    }

    return undefined;
  };

  const rentalId =
    (typeof orderData?.rentalId === "string" && isUuid(orderData.rentalId)
      ? orderData.rentalId
      : typeof orderData?.rental?.id === "string" && isUuid(orderData.rental.id)
        ? orderData.rental.id
        : typeof orderData?.id === "string" && isUuid(orderData.id)
          ? orderData.id
          : typeof orderData?.orderId === "string" && isUuid(orderData.orderId)
            ? orderData.orderId
            : undefined) ??
    findRentalUuid(orderData, false) ??
    (typeof orderId === "string" && isUuid(orderId) ? orderId : undefined);

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

  return (
    <>
      <div className="space-y-4">
        {/* Section Header */}
        <div>
          <Paragraph1 className="font-bold text-gray-900">
            Ready to Return?
          </Paragraph1>
          <Paragraph1 className="mt-1 text-gray-600">
            Return your item when you're finished with the rental
          </Paragraph1>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-start gap-2 bg-red-50 p-3 border border-red-200 rounded-lg">
            <AlertCircle
              size={16}
              className="flex-shrink-0 mt-0.5 text-red-600"
            />
            <Paragraph1 className="text-red-700 text-sm">
              {errorMessage}
            </Paragraph1>
          </div>
        )}

        {/* Info Cards */}
        <div className="gap-3 grid grid-cols-1">
          {/* Card 1: Easy Pickup */}
          <div className="hover:shadow-md p-4 border border-gray-200 rounded-lg transition">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 bg-blue-50 p-2 rounded-lg">
                <Truck className="text-blue-600" size={20} />
              </div>
              <div>
                <Paragraph1 className="font-semibold text-gray-900 text-sm">
                  Easy Pickup
                </Paragraph1>
                <Paragraph1 className="mt-0.5 text-gray-600 text-xs">
                  Schedule your pickup in seconds
                </Paragraph1>
              </div>
            </div>
          </div>

          {/* Card 2: Return on Time */}
          <div className="hover:shadow-md p-4 border border-gray-200 rounded-lg transition">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 bg-amber-50 p-2 rounded-lg">
                <Clock className="text-amber-600" size={20} />
              </div>
              <div>
                <Paragraph1 className="font-semibold text-gray-900 text-sm">
                  Return on Time
                </Paragraph1>
                <Paragraph1 className="mt-0.5 text-gray-600 text-xs">
                  Late returns attract extra rental charges
                </Paragraph1>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={initiateReturnMutation.isPending}
          className="flex justify-center items-center gap-2 bg-black hover:bg-gray-900 disabled:bg-gray-400 px-4 py-3 rounded-lg w-full font-semibold text-white transition disabled:cursor-not-allowed"
        >
          <Truck size={18} />
          {initiateReturnMutation.isPending
            ? "Processing..."
            : "Start Return Process"}
        </motion.button>
      </div>

      {/* Modal */}
      <ReadyToReturnModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleReturnConfirm}
        isLoading={initiateReturnMutation.isPending}
        orderId={orderId}
        rentalId={rentalId}
      />
    </>
  );
};

export default ReadyToReturnSection;
