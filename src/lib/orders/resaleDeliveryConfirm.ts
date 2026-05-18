/**
 * When the buyer may confirm resale receipt (matches backend resale-delivery.util).
 */

export type ResaleShipmentLeg = {
  id?: string | null;
  type?: string;
  status?: string;
  buyerConfirmedAt?: string | null;
};

export type ResaleOrderItemLine = {
  days?: number;
  product?: { listingType?: string } | null;
};

export type ConfirmableResaleShipment = {
  shipmentId: string;
  itemNames: string[];
};

const TERMINAL_STATUSES = new Set([
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "IN_DISPUTE",
  "RETURNED",
]);

export function orderHasResalePurchaseItems(
  orderItems: ResaleOrderItemLine[] | undefined,
): boolean {
  if (!orderItems?.length) return false;
  return orderItems.some((oi) => {
    const lt = oi.product?.listingType;
    const days = oi.days ?? 0;
    return lt === "RESALE" || (lt === "RENT_OR_RESALE" && days === 0);
  });
}

export function resaleShipmentLegs(
  shipments: ResaleShipmentLeg[] | undefined,
): ResaleShipmentLeg[] {
  return (shipments ?? []).filter((s) => s.type === "RESALE");
}

export function canConfirmResaleShipment(leg: ResaleShipmentLeg): boolean {
  return (
    leg.type === "RESALE" &&
    leg.status === "COMPLETED" &&
    !leg.buyerConfirmedAt
  );
}

export function listConfirmableResaleShipments(
  shipments: ResaleShipmentLeg[] | undefined,
): ResaleShipmentLeg[] {
  return resaleShipmentLegs(shipments).filter(canConfirmResaleShipment);
}

export function confirmableResaleShipmentsFromOrder(
  order: Record<string, unknown> | null | undefined,
): ConfirmableResaleShipment[] {
  if (!order) return [];
  const fromApi = order.confirmableResaleShipments as
    | ConfirmableResaleShipment[]
    | undefined;
  if (Array.isArray(fromApi) && fromApi.length > 0) {
    return fromApi.filter((r) => r.shipmentId);
  }
  return listConfirmableResaleShipments(
    (order.shipments ?? []) as ResaleShipmentLeg[],
  )
    .filter((leg) => leg.id)
    .map((leg) => ({
      shipmentId: String(leg.id),
      itemNames: [],
    }));
}

/** True when at least one RESALE package can be confirmed. */
export function canBuyerConfirmResaleReceipt(input: {
  listingType?: string;
  status?: string;
  deliveredAt?: string | null;
  shipments?: ResaleShipmentLeg[];
  orderItems?: ResaleOrderItemLine[];
}): boolean {
  const st = String(input.status ?? "").toUpperCase();
  if (TERMINAL_STATUSES.has(st)) return false;

  const lt = String(input.listingType ?? "").trim();
  if (lt !== "RESALE" && lt !== "RENT_OR_RESALE") return false;
  if (!orderHasResalePurchaseItems(input.orderItems)) return false;

  if (listConfirmableResaleShipments(input.shipments).length > 0) {
    return true;
  }

  const legs = resaleShipmentLegs(input.shipments);
  if (legs.length > 0) return false;

  if (input.deliveredAt) return true;
  const orderSt = String(input.status ?? "").toUpperCase();
  return orderSt === "DELIVERED" || orderSt === "COMPLETED";
}

export function shouldShowRenterResaleDeliveryConfirm(
  order: Record<string, unknown> | null | undefined,
): boolean {
  if (!order) return false;

  if (typeof order.canConfirmResaleDelivery === "boolean") {
    return order.canConfirmResaleDelivery;
  }

  const items = (order.items ?? order.orderItems) as
    | ResaleOrderItemLine[]
    | undefined;

  return canBuyerConfirmResaleReceipt({
    listingType: String(order.listingType ?? order.listing_type ?? ""),
    status: String(order.status ?? ""),
    deliveredAt:
      (order.deliveredAt as string | null | undefined) ??
      (order.delivered_at as string | null | undefined) ??
      null,
    shipments: (order.shipments ?? []) as ResaleShipmentLeg[],
    orderItems: items,
  });
}
