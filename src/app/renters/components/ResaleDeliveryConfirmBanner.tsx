"use client";

import { PackageCheck } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import type { ConfirmableResaleShipment } from "@/lib/orders/resaleDeliveryConfirm";

interface ResaleDeliveryConfirmBannerProps {
  packages: ConfirmableResaleShipment[];
  isPending: boolean;
  onConfirm: (shipmentId: string) => void;
}

function packageLabel(pkg: ConfirmableResaleShipment): string {
  if (pkg.itemNames.length === 0) return "this item";
  if (pkg.itemNames.length === 1) return pkg.itemNames[0];
  return pkg.itemNames.slice(0, 2).join(", ");
}

function PackageConfirmCard({
  pkg,
  packageIndex,
  packageTotal,
  isPending,
  onConfirm,
}: {
  pkg: ConfirmableResaleShipment;
  packageIndex: number;
  packageTotal: number;
  isPending: boolean;
  onConfirm: (shipmentId: string) => void;
}) {
  const label = packageLabel(pkg);

  return (
    <div className="rounded-xl border border-gray-900/10 bg-gray-50 p-3.5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white">
          <PackageCheck size={18} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="space-y-0.5">
            <Paragraph1 className="text-sm font-semibold leading-snug text-gray-900">
              Confirm delivery
            </Paragraph1>
            <Paragraph1 className="text-xs font-semibold text-gray-600">
              Package {packageIndex} of {packageTotal}
            </Paragraph1>
          </div>
          <Paragraph1 className="text-xs leading-relaxed text-gray-600">
            {label} was delivered. Confirm to release payment to the seller.
          </Paragraph1>
          <button
            type="button"
            disabled={isPending}
            onClick={() => onConfirm(pkg.shipmentId)}
            className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:pointer-events-none disabled:opacity-60"
          >
            {isPending ? "Confirming…" : "I received this item"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResaleDeliveryConfirmBanner({
  packages,
  isPending,
  onConfirm,
}: ResaleDeliveryConfirmBannerProps) {
  if (!packages.length) return null;

  return (
    <div className="space-y-2">
      {packages.map((pkg, index) => (
        <PackageConfirmCard
          key={pkg.shipmentId}
          pkg={pkg}
          packageIndex={index + 1}
          packageTotal={packages.length}
          isPending={isPending}
          onConfirm={onConfirm}
        />
      ))}
    </div>
  );
}
