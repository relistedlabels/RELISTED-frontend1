"use client";

import React from "react";
import {
  ExternalLink,
  Copy,
  ChevronDown,
} from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import DispatchWindowsDisplay, {
  type DispatchWindow,
} from "@/app/listers/components/DispatchWindowsDisplay";
import { toast } from "sonner";
import { ReturnPackageItems } from "@/lib/orders/returnPackageItems";

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
};

function CollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group overflow-hidden rounded-xl border border-gray-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3.5 py-3 text-sm font-semibold text-gray-900 marker:content-none [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          size={16}
          className="shrink-0 text-gray-400 transition group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-gray-100 px-3.5 pb-3.5 pt-2">{children}</div>
    </details>
  );
}

type ReturnLegDetail = {
  shipmentId: string;
  windowSummary?: string | null;
  trackingId?: string | null;
  providerTrackingUrl?: string | null;
  items?: Array<{ name: string; imageUrl?: string | null }>;
  returnRequest?: {
    status?: string;
    trackingNumber?: string | null;
  } | null;
};

interface OrderStatusDetailsProps {
  orderData?: Record<string, unknown>;
}

export default function OrderStatusDetails({
  orderData,
}: OrderStatusDetailsProps) {
  if (!orderData) return null;

  const dispatchWindows = orderData.dispatchWindows as
    | DispatchWindow[]
    | undefined;

  const returnLegs = (
    Array.isArray(orderData.returnLegDetails)
      ? orderData.returnLegDetails
      : []
  ) as ReturnLegDetail[];

  const activeReturnLegs = returnLegs.filter(
    (leg) =>
      leg.returnRequest?.status &&
      String(leg.returnRequest.status).toUpperCase() !== "REJECTED",
  );

  const hasDispatchWindows =
    dispatchWindows && dispatchWindows.length > 0;
  const hasShippingAddress = Boolean(orderData.shippingAddress);
  const hasReturnPickup = activeReturnLegs.some(
    (leg) =>
      leg.windowSummary ||
      leg.returnRequest?.trackingNumber ||
      leg.trackingId ||
      leg.providerTrackingUrl,
  );

  if (!hasDispatchWindows && !hasShippingAddress && !hasReturnPickup) {
    return null;
  }

  return (
    <div className="space-y-2">
      {hasReturnPickup ? (
        <CollapsibleSection
          title={activeReturnLegs.length > 1 ? "Return pickups" : "Return pickup"}
        >
          <div className="space-y-3 text-sm">
            {activeReturnLegs.map((leg, idx) => (
              <div
                key={leg.shipmentId}
                className={
                  idx > 0 ? "space-y-2 border-t border-gray-100 pt-3" : "space-y-2"
                }
              >
                {activeReturnLegs.length > 1 ? (
                  <Paragraph1 className="text-xs font-semibold text-gray-700">
                    Package {idx + 1}
                  </Paragraph1>
                ) : null}
                <ReturnPackageItems items={leg.items ?? []} />
                {leg.windowSummary ? (
                  <Paragraph1 className="text-xs text-gray-800">
                    {leg.windowSummary}
                  </Paragraph1>
                ) : null}
                {(leg.returnRequest?.trackingNumber || leg.trackingId) && (
                  <div className="flex items-center gap-2">
                    <Paragraph1 className="font-mono text-xs font-semibold text-gray-900">
                      {leg.returnRequest?.trackingNumber ?? leg.trackingId}
                    </Paragraph1>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          String(
                            leg.returnRequest?.trackingNumber ?? leg.trackingId,
                          ),
                        )
                      }
                      className="text-gray-500 hover:text-gray-800"
                      aria-label="Copy tracking number"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}
                {leg.providerTrackingUrl ? (
                  <a
                    href={leg.providerTrackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600"
                  >
                    <ExternalLink size={14} />
                    Track return
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      ) : null}

      {hasDispatchWindows ? (
        <CollapsibleSection title="Delivery schedule">
          <DispatchWindowsDisplay
            dispatchWindows={dispatchWindows}
            orderData={orderData}
            sectionTitle=""
          />
        </CollapsibleSection>
      ) : null}

      {hasShippingAddress ? (
        <CollapsibleSection title="Shipping address">
          <AddressBlock address={orderData.shippingAddress as Record<string, string>} />
        </CollapsibleSection>
      ) : null}
    </div>
  );
}

function AddressBlock({ address }: { address: Record<string, string> }) {
  const line = [address.street, address.city, address.state]
    .filter(Boolean)
    .join(", ");
  return <Paragraph1 className="text-sm text-gray-700">{line || "—"}</Paragraph1>;
}
