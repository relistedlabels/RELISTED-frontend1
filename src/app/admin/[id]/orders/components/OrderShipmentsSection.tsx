"use client";

import { ChevronRight, Truck } from "lucide-react";
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
  DISPATCHING: "bg-blue-100 text-blue-700",
  DISPATCH_FAILED: "bg-red-100 text-red-700",
  DISPATCHED: "bg-blue-100 text-blue-700",
  IN_TRANSIT: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
};

const ShipmentRow = ({ shipment }: { shipment: Shipment }) => {
  const params = useParams();
  const adminId = Array.isArray(params.id) ? params.id[0] : params.id;
  const statusColor =
    SHIPMENT_STATUS_COLORS[shipment.status] ?? "bg-gray-100 text-gray-700";

  return (
    <Link
      href={`/admin/${adminId}/shipments?shipmentId=${shipment.id}`}
      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition hover:bg-gray-50"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
        <Truck size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <Paragraph1 className="truncate text-sm font-semibold text-gray-900">
          {getShipmentLegDisplayLabel(shipment.type)}
        </Paragraph1>
        <Paragraph1 className="text-xs text-gray-500">
          {formatDate(shipment.scheduledDate)}
        </Paragraph1>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusColor}`}
      >
        {getShipmentStatusLabel(shipment.type, shipment.status)}
      </span>
      <ChevronRight size={16} className="shrink-0 text-gray-400" />
    </Link>
  );
};

interface OrderShipmentsSectionProps {
  orderId: string | null;
}

const OrderShipmentsSection = ({ orderId }: OrderShipmentsSectionProps) => {
  const { data, isLoading } = useShipments(
    orderId ? { orderId, limit: 20 } : undefined,
  );
  const shipments = data?.data?.shipments ?? [];

  if (!orderId || isLoading || shipments.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-6">
      <Paragraph3 className="mb-4 text-base font-bold text-gray-900">
        Shipments
      </Paragraph3>
      <div className="space-y-2">
        {shipments.map((s) => (
          <ShipmentRow key={s.id} shipment={s} />
        ))}
      </div>
    </div>
  );
};

export default OrderShipmentsSection;
