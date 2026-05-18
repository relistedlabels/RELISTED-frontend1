"use client";

import React from "react";
import {
  Lock,
  ShoppingBag,
  AlertCircle,
  ExternalLink,
  Copy,
  ChevronDown,
} from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { isListerResaleOrder } from "@/lib/listers/listerOrderRow";
import DispatchWindowsDisplay, {
  type DispatchWindow,
} from "@/app/listers/components/DispatchWindowsDisplay";
import { toast } from "sonner";

const CURRENCY = "₦";

const formatCurrency = (amount: number | undefined): string => {
  if (!amount) return "0";
  return amount.toLocaleString("en-NG");
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
};

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      className="group rounded-xl border border-gray-200 bg-white overflow-hidden"
      open={defaultOpen}
    >
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

interface OrderStatusDetailsProps {
  orderData?: Record<string, unknown>;
}

export default function OrderStatusDetails({
  orderData,
}: OrderStatusDetailsProps) {
  if (!orderData) return null;

  const lockedAmount = Number(orderData.totalAmount ?? 0);
  const items = Array.isArray(orderData.items) ? orderData.items : [];
  const statusKey = String(orderData.status ?? "").toUpperCase();
  const terminalOrderStatuses = new Set([
    "COMPLETED",
    "RETURNED",
    "CANCELLED",
    "REJECTED",
  ]);
  const resaleOnlyOrder = isListerResaleOrder(orderData);
  const showLockedFundsNotice =
    !resaleOnlyOrder &&
    !terminalOrderStatuses.has(statusKey) &&
    lockedAmount > 0;

  const dispatchWindows = orderData.dispatchWindows as
    | DispatchWindow[]
    | undefined;

  const itemEnds = items
    .map((it: { rentalEndDate?: string | null }) => it.rentalEndDate)
    .filter(Boolean) as string[];
  const latestItemEnd = itemEnds.reduce<string | undefined>((best, d) => {
    if (!best) return d;
    return new Date(d) > new Date(best) ? d : best;
  }, undefined);
  const rentalEndDate =
    (orderData.rentalEndDate as string | undefined) ||
    latestItemEnd ||
    (items[0] as { rentalEndDate?: string })?.rentalEndDate;
  const returnDate = rentalEndDate
    ? new Date(rentalEndDate).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const returnPickup = orderData.returnPickup as
    | {
        pickupWindowSummary?: string;
        trackingNumber?: string;
      }
    | undefined;
  const returnLeg = orderData.returnLeg as
    | {
        trackingId?: string;
        providerTrackingUrl?: string;
      }
    | undefined;

  const hasReturnDetails =
    Boolean(String(returnPickup?.pickupWindowSummary ?? "").trim()) ||
    Boolean(String(returnPickup?.trackingNumber ?? "").trim()) ||
    Boolean(
      String(returnLeg?.trackingId ?? "").trim() ||
        String(returnLeg?.providerTrackingUrl ?? "").trim(),
    );

  const hasExtras =
    showLockedFundsNotice ||
    (dispatchWindows && dispatchWindows.length > 0) ||
    (!resaleOnlyOrder && (returnDate || hasReturnDetails)) ||
    Boolean(orderData.shippingAddress);

  if (!hasExtras) return null;

  return (
    <div className="space-y-2">
      <Paragraph1 className="px-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
        More details
      </Paragraph1>

      {showLockedFundsNotice ? (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50/80 px-3.5 py-3">
          <div className="flex gap-3">
            <Lock size={18} className="mt-0.5 shrink-0 text-yellow-700" />
            <div>
              <Paragraph1 className="text-sm font-semibold text-gray-900">
                {CURRENCY}
                {formatCurrency(lockedAmount)} held in escrow
              </Paragraph1>
              <Paragraph1 className="mt-1 text-xs text-gray-600 leading-relaxed">
                Released after you return the item and the lister approves it.
              </Paragraph1>
            </div>
          </div>
        </div>
      ) : null}

      {dispatchWindows && dispatchWindows.length > 0 ? (
        <CollapsibleSection title="Delivery schedule">
          <DispatchWindowsDisplay
            dispatchWindows={dispatchWindows}
            orderData={orderData}
            sectionTitle=""
          />
        </CollapsibleSection>
      ) : null}

      {!resaleOnlyOrder && (returnDate || orderData.canReturn != null) ? (
        <CollapsibleSection title="Return">
          <div className="flex gap-3">
            <ShoppingBag size={16} className="mt-0.5 shrink-0 text-blue-600" />
            <div className="space-y-2">
              {returnDate ? (
                <Paragraph1 className="text-sm text-gray-700">
                  Return by{" "}
                  <span className="font-semibold text-gray-900">{returnDate}</span>
                </Paragraph1>
              ) : null}
              {orderData.canReturn === false ? (
                <div className="flex gap-2 rounded-lg border border-orange-200 bg-orange-50 p-2.5">
                  <AlertCircle size={14} className="mt-0.5 shrink-0 text-orange-600" />
                  <Paragraph1 className="text-xs text-orange-800">
                    You can start the return after the rental period ends.
                  </Paragraph1>
                </div>
              ) : null}
              {orderData.canReturn === true ? (
                <div className="flex gap-2 rounded-lg border border-green-200 bg-green-50 p-2.5">
                  <AlertCircle size={14} className="mt-0.5 shrink-0 text-green-600" />
                  <Paragraph1 className="text-xs text-green-800">
                    You can start the return process now.
                  </Paragraph1>
                </div>
              ) : null}
            </div>
          </div>
        </CollapsibleSection>
      ) : null}

      {!resaleOnlyOrder && hasReturnDetails ? (
        <CollapsibleSection title="Return pickup">
          <div className="space-y-3 text-sm">
            {returnPickup?.pickupWindowSummary ? (
              <div>
                <Paragraph1 className="text-xs text-gray-500">Pickup window</Paragraph1>
                <Paragraph1 className="font-semibold text-gray-900">
                  {returnPickup.pickupWindowSummary}
                </Paragraph1>
              </div>
            ) : null}
            {returnPickup?.trackingNumber ? (
              <div className="flex items-center gap-2">
                <Paragraph1 className="font-mono font-semibold text-gray-900">
                  {returnPickup.trackingNumber}
                </Paragraph1>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(String(returnPickup.trackingNumber))
                  }
                  className="p-1 text-gray-500"
                >
                  <Copy size={14} />
                </button>
              </div>
            ) : null}
            {returnLeg?.providerTrackingUrl ? (
              <a
                href={returnLeg.providerTrackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-blue-600"
              >
                <ExternalLink size={14} />
                Track return
              </a>
            ) : null}
          </div>
        </CollapsibleSection>
      ) : null}

      {orderData.shippingAddress ? (
        <CollapsibleSection title="Shipping address">
          <AddressBlock address={orderData.shippingAddress as Record<string, string>} />
        </CollapsibleSection>
      ) : null}
    </div>
  );
}

function AddressBlock({ address }: { address: Record<string, string> }) {
  return (
    <Paragraph1 className="text-sm text-gray-700 leading-relaxed">
      {address.street}
      <br />
      {address.city}, {address.state} {address.zipCode}
      <br />
      {address.country}
    </Paragraph1>
  );
}
