"use client";

import React, { useState } from "react";
import { Truck } from "lucide-react";
import { buttonPrimary, buttonSecondary } from "@/common/ui/buttonClasses";
import ReadyToReturnModal from "./ReadyToReturnModal";
import { useInitiateReturn } from "@/lib/queries/renters/useInitiateReturn";

interface StartReturnActionProps {
  orderId: string;
  shipmentId?: string | null;
  variant?: "footer" | "dashboard";
  className?: string;
}

export default function StartReturnAction({
  orderId,
  shipmentId,
  variant = "footer",
  className = "",
}: StartReturnActionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const initiateReturnMutation = useInitiateReturn();

  const handleReturnConfirm = async (
    images: string[],
    itemCondition: "GOOD" | "FAIR" | "POOR",
    damageNotes: string,
    pickupWindow: { start: string; end: string },
  ): Promise<void> => {
    await initiateReturnMutation.mutateAsync({
      orderId,
      shipmentId: shipmentId ?? undefined,
      images,
      itemCondition,
      damageNotes,
      pickupWindow,
    });
  };

  const label = initiateReturnMutation.isPending ? "Processing…" : "Start return";

  const base =
    variant === "footer"
      ? `${buttonPrimary} flex-1`
      : `${buttonSecondary} w-full sm:w-auto`;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        disabled={initiateReturnMutation.isPending}
        className={`${base} ${className}`.trim()}
      >
        <Truck size={16} aria-hidden />
        {label}
      </button>

      <ReadyToReturnModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleReturnConfirm}
        isLoading={initiateReturnMutation.isPending}
        orderId={orderId}
        shipmentId={shipmentId ?? undefined}
      />
    </>
  );
}
