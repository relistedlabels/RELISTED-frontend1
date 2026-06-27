/**
 * When the renter may confirm rental receipt (matches backend rental-delivery.util).
 */

export type RentalShipmentLeg = {
  id?: string | null;
  type?: string;
  status?: string;
  buyerConfirmedAt?: string | null;
  updatedAt?: string | null;
};

export type RentalOrderItemLine = {
  days?: number;
  product?: { listingType?: string } | null;
};

export type ConfirmableRentalShipment = {
  shipmentId: string;
  itemNames: string[];
  inspectionDeadline?: string | null;
};

const TERMINAL_STATUSES = new Set([
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "IN_DISPUTE",
  "RETURNED",
]);

export function orderHasRentalLines(
  orderItems: RentalOrderItemLine[] | undefined,
): boolean {
  if (!orderItems?.length) return false;
  return orderItems.some((oi) => {
    const lt = oi.product?.listingType;
    const days = oi.days ?? 0;
    return days > 0 && (lt === "RENTAL" || lt === "RENT_OR_RESALE");
  });
}

export function rentalOutboundShipmentLegs(
  shipments: RentalShipmentLeg[] | undefined,
): RentalShipmentLeg[] {
  return (shipments ?? []).filter((s) => s.type === "OUTBOUND");
}

export function canConfirmRentalShipment(leg: RentalShipmentLeg): boolean {
  return (
    leg.type === "OUTBOUND" &&
    leg.status === "COMPLETED" &&
    !leg.buyerConfirmedAt
  );
}

export function listConfirmableRentalShipments(
  shipments: RentalShipmentLeg[] | undefined,
): RentalShipmentLeg[] {
  return rentalOutboundShipmentLegs(shipments).filter(canConfirmRentalShipment);
}

export function confirmableRentalShipmentsFromOrder(
  order: Record<string, unknown> | null | undefined,
): ConfirmableRentalShipment[] {
  if (!order) return [];
  const fromApi = order.confirmableRentalShipments as
    | ConfirmableRentalShipment[]
    | undefined;
  if (Array.isArray(fromApi) && fromApi.length > 0) {
    return fromApi.filter((r) => r.shipmentId);
  }
  return listConfirmableRentalShipments(
    (order.shipments ?? []) as RentalShipmentLeg[],
  )
    .filter((leg) => leg.id)
    .map((leg) => ({
      shipmentId: String(leg.id),
      itemNames: [],
    }));
}

export function canBuyerConfirmRentalReceipt(input: {
  listingType?: string;
  status?: string;
  deliveredAt?: string | null;
  shipments?: RentalShipmentLeg[];
  orderItems?: RentalOrderItemLine[];
}): boolean {
  const st = String(input.status ?? "").toUpperCase();
  if (TERMINAL_STATUSES.has(st)) return false;

  const lt = String(input.listingType ?? "").trim();
  if (lt !== "RENTAL" && lt !== "RENT_OR_RESALE") return false;
  if (!orderHasRentalLines(input.orderItems)) return false;

  if (listConfirmableRentalShipments(input.shipments).length > 0) {
    return true;
  }

  const legs = rentalOutboundShipmentLegs(input.shipments);
  if (legs.length > 0) return false;

  if (input.deliveredAt) return true;
  const orderSt = String(input.status ?? "").toUpperCase();
  return orderSt === "DELIVERED" || orderSt === "ACTIVE";
}

export function shouldShowRenterRentalDeliveryConfirm(
  order: Record<string, unknown> | null | undefined,
): boolean {
  if (!order) return false;

  if (typeof order.canConfirmRentalDelivery === "boolean") {
    return order.canConfirmRentalDelivery;
  }

  const items = (order.items ?? order.orderItems) as
    | RentalOrderItemLine[]
    | undefined;

  return canBuyerConfirmRentalReceipt({
    listingType: String(order.listingType ?? order.listing_type ?? ""),
    status: String(order.status ?? ""),
    deliveredAt:
      (order.deliveredAt as string | null | undefined) ??
      (order.delivered_at as string | null | undefined) ??
      null,
    shipments: (order.shipments ?? []) as RentalShipmentLeg[],
    orderItems: items,
  });
}

export function canRaiseRentalDeliveryDisputeFromOrder(
  order: Record<string, unknown> | null | undefined,
): boolean {
  if (!order) return false;
  if (typeof order.canRaiseRentalDeliveryDispute === "boolean") {
    return order.canRaiseRentalDeliveryDispute;
  }
  return shouldShowRenterRentalDeliveryConfirm(order);
}

export function rentalInspectionLabelFromOrder(
  order: Record<string, unknown> | null | undefined,
): string {
  const label = order?.rentalInspectionPeriodLabel;
  return typeof label === "string" && label.trim() ? label : "1 hour";
}

export function firstRentalItemIdFromOrder(
  order: Record<string, unknown> | null | undefined,
): string | null {
  const items = (order?.items ?? []) as Array<{ id?: string; days?: number; listingType?: string }>;
  const rental = items.find(
    (i) =>
      (i.days ?? 0) > 0 &&
      (i.listingType === "RENTAL" || i.listingType === "RENT_OR_RESALE"),
  );
  return rental?.id ? String(rental.id) : items[0]?.id ? String(items[0].id) : null;
}
