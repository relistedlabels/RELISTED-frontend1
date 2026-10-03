"use client";

import { ArrowRight, Truck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import type { Shipment } from "@/lib/api/shipments";
import {
  getShipmentLegDisplayLabel,
  getShipmentStatusLabel,
} from "@/lib/orders/shipmentAndOrderLabels";
import { useShipments } from "@/lib/queries/admin/useShipments";

const SHIPMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  DISPATCHING: "bg-blue-50 text-blue-700",
  DISPATCH_FAILED: "bg-red-50 text-red-700",
  DISPATCHED: "bg-blue-50 text-blue-700",
  IN_TRANSIT: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const ShipmentRow = ({
  shipment,
  adminId,
}: {
  shipment: Shipment;
  adminId: string;
}) => {
  const statusColor =
    SHIPMENT_STATUS_COLORS[shipment.status] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex min-h-14 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-600">
            <Truck size={18} />
          </span>
          <div className="min-w-0">
            <Paragraph1 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Shipment
            </Paragraph1>
            <Paragraph1 className="mt-0.5 text-sm font-semibold text-gray-900">
              {getShipmentLegDisplayLabel(shipment.type)}
            </Paragraph1>
          </div>
        </div>
        <span
          className={`max-w-[55%] rounded-full px-2.5 py-1 text-center text-xs font-semibold whitespace-normal ${statusColor}`}
        >
          {getShipmentStatusLabel(shipment.type, shipment.status)}
        </span>
      </div>
      <Link
        href={`/admin/${adminId}/shipments?shipmentId=${encodeURIComponent(shipment.id)}`}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 border-t border-gray-100 pt-3 text-sm font-semibold text-gray-700 transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        View shipment
        <ArrowRight size={16} />
      </Link>
    </div>
  );
};

interface OrderShipmentsSectionProps {
  orderId: string | null;
  isPurchaseOrder: boolean;
}

const OrderShipmentsSection = ({
  orderId,
  isPurchaseOrder,
}: OrderShipmentsSectionProps) => {
  const params = useParams();
  const adminId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, isLoading } = useShipments(
    orderId ? { orderId, limit: 20 } : undefined,
  );
  const shipments = (data?.data?.shipments ?? []).filter((shipment) =>
    isPurchaseOrder
      ? shipment.type === "OUTBOUND" || shipment.type === "RESALE"
      : shipment.type === "OUTBOUND" || shipment.type === "RETURN",
  );

  if (!orderId || !adminId || isLoading || shipments.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-6">
      <Paragraph3 className="mb-4 text-base font-bold text-gray-900">
        Shipments
      </Paragraph3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {shipments.map((shipment) => (
          <ShipmentRow
            key={shipment.id}
            shipment={shipment}
            adminId={adminId}
          />
        ))}
      </div>
    </div>
  );
};

export default OrderShipmentsSection;
