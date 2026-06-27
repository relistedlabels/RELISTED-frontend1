"use client";

import StartReturnAction from "./StartReturnAction";

interface DashboardStartReturnButtonProps {
  orderId: string;
  shipmentId?: string | null;
}

export default function DashboardStartReturnButton({
  orderId,
  shipmentId,
}: DashboardStartReturnButtonProps) {
  return (
    <StartReturnAction
      orderId={orderId}
      shipmentId={shipmentId}
      variant="dashboard"
    />
  );
}
