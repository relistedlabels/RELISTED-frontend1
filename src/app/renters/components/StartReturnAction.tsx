"use client";

import React, { useState } from "react";
import { Truck } from "lucide-react";
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

  const label = initiateReturnMutation.isPending
    ? "Processing…"
    : variant === "dashboard"
      ? "Start Return Process"
      : "Start Return";

  const base =
    variant === "footer"
      ? "flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
      : "flex w-full items-center justify-center gap-2 rounded-sm border border-black bg-white px-4 py-2 text-black transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit";

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
