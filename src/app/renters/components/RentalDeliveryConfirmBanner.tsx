"use client";

import React, { useMemo, useState } from "react";
import { AlertTriangle, PackageCheck } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import type { ConfirmableRentalShipment } from "@/lib/orders/rentalDeliveryConfirm";
import RentalDeliveryIssueModal from "./RentalDeliveryIssueModal";

interface RentalDeliveryConfirmBannerProps {
  packages: ConfirmableRentalShipment[];
  inspectionLabel: string;
  orderId: string;
  orderDisplayId: string;
  itemId: string | null;
  canReportIssue: boolean;
  isPending: boolean;
  onConfirm: (shipmentId: string) => void;
}

function packageLabel(pkg: ConfirmableRentalShipment): string {
  if (pkg.itemNames.length === 0) return "your rental";
  if (pkg.itemNames.length === 1) return pkg.itemNames[0];
  return pkg.itemNames.slice(0, 2).join(", ");
}

function formatDeadline(deadline?: string | null): string | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function PackageConfirmCard({
  pkg,
  packageIndex,
  packageTotal,
  inspectionLabel,
  orderId,
  orderDisplayId,
  itemId,
  canReportIssue,
  isPending,
  onConfirm,
}: {
  pkg: ConfirmableRentalShipment;
  packageIndex: number;
  packageTotal: number;
  inspectionLabel: string;
  orderId: string;
  orderDisplayId: string;
  itemId: string | null;
  canReportIssue: boolean;
  isPending: boolean;
  onConfirm: (shipmentId: string) => void;
}) {
  const [issueOpen, setIssueOpen] = useState(false);
  const label = packageLabel(pkg);
  const deadlineLabel = formatDeadline(pkg.inspectionDeadline);

  return (
    <>
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white">
            <PackageCheck size={18} aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="space-y-0.5">
              <Paragraph1 className="text-sm font-semibold leading-snug text-gray-900">
                Confirm your rental delivery
              </Paragraph1>
              {packageTotal > 1 ? (
                <Paragraph1 className="text-xs font-semibold text-gray-600">
                  Package {packageIndex} of {packageTotal}
                </Paragraph1>
              ) : null}
            </div>
            <Paragraph1 className="text-xs leading-relaxed text-gray-700">
              Delivered. Confirm within {inspectionLabel}
              {deadlineLabel ? ` (by ${deadlineLabel})` : ""}.
            </Paragraph1>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={isPending}
                onClick={() => onConfirm(pkg.shipmentId)}
                className="flex-1 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:pointer-events-none disabled:opacity-60"
              >
                {isPending ? "Confirming…" : "I received this item"}
              </button>
              {canReportIssue && itemId ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setIssueOpen(true)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-950 transition hover:bg-amber-50 disabled:pointer-events-none disabled:opacity-60"
                >
                  <AlertTriangle size={15} aria-hidden />
                  Report an issue
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {issueOpen && itemId ? (
        <RentalDeliveryIssueModal
          isOpen={issueOpen}
          onClose={() => setIssueOpen(false)}
          orderId={orderId}
          orderDisplayId={orderDisplayId}
          itemId={itemId}
          itemLabel={label}
          inspectionLabel={inspectionLabel}
        />
      ) : null}
    </>
  );
}

export default function RentalDeliveryConfirmBanner({
  packages,
  inspectionLabel,
  orderId,
  orderDisplayId,
  itemId,
  canReportIssue,
  isPending,
  onConfirm,
}: RentalDeliveryConfirmBannerProps) {
  const sorted = useMemo(
    () => [...packages].sort((a, b) => a.shipmentId.localeCompare(b.shipmentId)),
    [packages],
  );

  if (!sorted.length) return null;

  return (
    <div className="space-y-2">
      {sorted.map((pkg, index) => (
        <PackageConfirmCard
          key={pkg.shipmentId}
          pkg={pkg}
          packageIndex={index + 1}
          packageTotal={sorted.length}
          inspectionLabel={inspectionLabel}
          orderId={orderId}
          orderDisplayId={orderDisplayId}
          itemId={itemId}
          canReportIssue={canReportIssue}
          isPending={isPending}
          onConfirm={onConfirm}
        />
      ))}
    </div>
  );
}
