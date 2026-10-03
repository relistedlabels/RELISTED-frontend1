"use client";

import React, { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import DispatchWindowsDisplay, {
  type DispatchWindow,
} from "@/app/listers/components/DispatchWindowsDisplay";

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

function DetailSubsection({
  title,
  children,
  bordered = false,
}: {
  title: string;
  children: React.ReactNode;
  bordered?: boolean;
}) {
  return (
    <section className={bordered ? "border-t border-gray-100 pt-3" : ""}>
      <Paragraph1 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </Paragraph1>
      {children}
    </section>
  );
}

type ShipmentLeg = {
  type?: string;
  trackingId?: string | null;
  providerTrackingUrl?: string | null;
};

type ReturnLegDetail = {
  shipmentId: string;
  trackingId?: string | null;
  providerTrackingUrl?: string | null;
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

  const hasDispatchWindows = Boolean(dispatchWindows?.length);
  const hasShippingAddress = Boolean(orderData.shippingAddress);

  const trackingByType = useMemo(() => {
    const shipments = (
      Array.isArray(orderData.shipments) ? orderData.shipments : []
    ) as ShipmentLeg[];
    const outbound = shipments.find((s) => s.type === "OUTBOUND");
    const returnLeg = activeReturnLegs[0];

    const map: Partial<
      Record<DispatchWindow["type"], { trackingId?: string | null; providerTrackingUrl?: string | null }>
    > = {};

    if (outbound?.providerTrackingUrl || outbound?.trackingId) {
      map.OUTBOUND = {
        trackingId: outbound.trackingId,
        providerTrackingUrl: outbound.providerTrackingUrl,
      };
    }
    if (returnLeg?.providerTrackingUrl || returnLeg?.trackingId || returnLeg?.returnRequest?.trackingNumber) {
      map.RETURN = {
        trackingId:
          returnLeg.returnRequest?.trackingNumber ?? returnLeg.trackingId,
        providerTrackingUrl: returnLeg.providerTrackingUrl,
      };
    }

    return Object.keys(map).length > 0 ? map : undefined;
  }, [activeReturnLegs, orderData.shipments]);

  if (!hasDispatchWindows && !hasShippingAddress) {
    return null;
  }

  return (
    <CollapsibleSection title="Delivery & returns">
      <div className="space-y-3 text-sm">
        {hasShippingAddress ? (
          <DetailSubsection title="Shipping address">
            <AddressBlock address={orderData.shippingAddress as Record<string, string>} />
          </DetailSubsection>
        ) : null}

        {hasDispatchWindows ? (
          <DetailSubsection title="Delivery schedule" bordered={hasShippingAddress}>
            <DispatchWindowsDisplay
              dispatchWindows={dispatchWindows}
              orderData={orderData}
              sectionTitle=""
              trackingByType={trackingByType}
            />
          </DetailSubsection>
        ) : null}
      </div>
    </CollapsibleSection>
  );
}

function AddressBlock({ address }: { address: Record<string, string> }) {
  const line = [address.street, address.city, address.state]
    .filter(Boolean)
    .join(", ");
  return <Paragraph1 className="text-sm text-gray-700">{line || "—"}</Paragraph1>;
}
