"use client";

import StartReturnAction from "./StartReturnAction";

interface DashboardStartReturnButtonProps {
  orderId: string;
  shipmentId?: string | null;
  urgent?: boolean;
}

export default function DashboardStartReturnButton({
  orderId,
  shipmentId,
  urgent = false,
}: DashboardStartReturnButtonProps) {
  return (
    <StartReturnAction
      orderId={orderId}
      shipmentId={shipmentId}
      variant="dashboard"
      urgent={urgent}
    />
  );
}
