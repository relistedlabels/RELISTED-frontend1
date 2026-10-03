"use client";

import StartReturnAction from "./StartReturnAction";

interface DashboardStartReturnButtonProps {
  orderId: string;
  shipmentId?: string | null;
  urgent?: boolean;
  autoOpen?: boolean;
}

export default function DashboardStartReturnButton({
  orderId,
  shipmentId,
  urgent = false,
  autoOpen = false,
}: DashboardStartReturnButtonProps) {
  return (
    <StartReturnAction
      orderId={orderId}
      shipmentId={shipmentId}
      variant="dashboard"
      urgent={urgent}
      autoOpen={autoOpen}
    />
  );
}
