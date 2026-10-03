import React from "react";
import {
  amountAfterPlatformFee,
  LISTER_PLATFORM_FEE_PERCENT,
} from "@/lib/listers/platformFee";

interface PayoutHintProps {
  amount: number;
  suffix?: string;
}

/** Subtle note showing what the lister keeps after the platform fee. */
export const PayoutHint: React.FC<PayoutHintProps> = ({ amount, suffix }) => {
  if (LISTER_PLATFORM_FEE_PERCENT <= 0) return null;
  return (
    <p className="mt-1 text-[11px] text-gray-400">
      {amount > 0
        ? `You'll receive ₦${amountAfterPlatformFee(amount).toLocaleString("en-US")}${suffix ?? ""} after our ${LISTER_PLATFORM_FEE_PERCENT}% platform fee`
        : `We take a ${LISTER_PLATFORM_FEE_PERCENT}% platform fee on each rental or sale`}
    </p>
  );
};
