/**
 * Mirrors backend renter-start-return.util (OUTBOUND delivered → show return CTA).
 */

export type RenterStartReturnShipment = {
  id?: string;
  type?: string;
  status?: string;
  listerId?: string | null;
};

export type RenterStartReturnRequest = {
  shipmentId?: string | null;
  status?: string;
};

export type RenterStartReturnItem = {
  days?: number;
  listingType?: string;
  product?: { listingType?: string | null } | null;
};

const TERMINAL_ORDER_STATUSES = new Set([
  "COMPLETED",
  "RETURNED",
  "CANCELLED",
  "REJECTED",
]);

export function orderHasRentalLinesForReturn(
  orderItems: RenterStartReturnItem[] | null | undefined,
): boolean {
  return (orderItems ?? []).some((item) => {
    const days = item.days ?? 0;
    const lt = item.listingType ?? item.product?.listingType;
    return days > 0 && (lt === "RENTAL" || lt === "RENT_OR_RESALE");
  });
}

function outboundDeliveredForReturnLeg(
  outboundLegs: RenterStartReturnShipment[],
  returnLeg: RenterStartReturnShipment,
): boolean {
  const delivered = outboundLegs.filter((leg) => leg.status === "COMPLETED");
  if (delivered.length === 0) return false;
  if (returnLeg.listerId) {
    return delivered.some(
      (leg) => !leg.listerId || leg.listerId === returnLeg.listerId,
    );
  }
  return true;
}

function hasActiveReturnForLeg(
  returnRequests: RenterStartReturnRequest[],
  shipmentId: string,
  returnLegCount: number,
): boolean {
  const active = returnRequests.filter(
    (rr) => String(rr.status ?? "").toUpperCase() !== "REJECTED",
  );
  if (active.some((rr) => rr.shipmentId === shipmentId)) return true;
  if (active.length === 1 && !active[0].shipmentId && returnLegCount === 1) {
    return true;
  }
  return false;
}

export function resolveRenterStartReturn(input: {
  status?: string;
  items?: RenterStartReturnItem[];
  shipments?: RenterStartReturnShipment[];
  returnRequests?: RenterStartReturnRequest[];
  showStartReturn?: boolean;
  startReturnShipmentId?: string | null;
}): { showStartReturn: boolean; returnShipmentId: string | null } {
  if (typeof input.showStartReturn === "boolean") {
    return {
      showStartReturn: input.showStartReturn,
      returnShipmentId: input.startReturnShipmentId ?? null,
    };
  }

  const statusKey = String(input.status ?? "").toUpperCase();
  if (TERMINAL_ORDER_STATUSES.has(statusKey)) {
    return { showStartReturn: false, returnShipmentId: null };
  }

  const orderItems = input.items ?? [];
  if (!orderHasRentalLinesForReturn(orderItems)) {
    return { showStartReturn: false, returnShipmentId: null };
  }

  const outboundLegs = (input.shipments ?? []).filter(
    (leg) => leg.type === "OUTBOUND",
  );
  const returnLegs = (input.shipments ?? []).filter(
    (leg) => leg.type === "RETURN",
  );
  const returnRequests = input.returnRequests ?? [];

  for (const returnLeg of returnLegs) {
    if (!returnLeg.id) continue;
    if (!outboundDeliveredForReturnLeg(outboundLegs, returnLeg)) continue;
    if (
      hasActiveReturnForLeg(returnRequests, returnLeg.id, returnLegs.length)
    ) {
      continue;
    }
    return { showStartReturn: true, returnShipmentId: returnLeg.id };
  }

  return { showStartReturn: false, returnShipmentId: null };
}
