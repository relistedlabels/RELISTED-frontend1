import type { ShipmentStatus, ShipmentType } from "@/lib/api/shipments";

/** User-facing copy for a checkout shipment leg (domain enums stay OUTBOUND / RETURN / RESALE). */
export function getShipmentLegDisplayLabel(
  type: ShipmentType | string | null | undefined,
): string {
  const t = String(type ?? "").toUpperCase();
  switch (t) {
    case "OUTBOUND":
      return "Rental delivery";
    case "RETURN":
      return "Rental return";
    case "RESALE":
      return "Resale delivery";
    default:
      return t || "Shipment";
  }
}

/** Admin detail: who is pickup vs delivery for each leg. */
export function getShipmentPartyRowLabels(
  type: ShipmentType | string | null | undefined,
): { pickupHeading: string; deliveryHeading: string } {
  const t = String(type ?? "").toUpperCase();
  if (t === "RETURN") {
    return {
      pickupHeading: "Pickup from (renter)",
      deliveryHeading: "Deliver to (lister)",
    };
  }
  if (t === "RESALE") {
    return {
      pickupHeading: "Pickup from (lister)",
      deliveryHeading: "Deliver to (buyer)",
    };
  }
  return {
    pickupHeading: "Pickup from (lister)",
    deliveryHeading: "Deliver to (renter)",
  };
}

/**
 * Human-readable shipment state. For RETURN legs, "DISPATCHED" means the
 * carrier is booked for the pickup window — not that the package is already
 * in transit to the lister.
 */
export function getShipmentStatusLabel(
  legType: ShipmentType | string | null | undefined,
  status: ShipmentStatus | string,
): string {
  const s = String(status) as ShipmentStatus;
  const t = String(legType ?? "").toUpperCase();

  if (t === "RETURN") {
    switch (s) {
      case "PENDING":
        return "Return pickup not scheduled yet";
      case "DISPATCHING":
        return "Booking with carrier";
      case "DISPATCHED":
        return "Return pickup scheduled";
      case "IN_TRANSIT":
        return "Return on the way to lister";
      case "COMPLETED":
        return "Delivered to lister";
      case "DISPATCH_FAILED":
        return "Dispatch failed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return String(status);
    }
  }

  switch (s) {
    case "PENDING":
      return "Pending";
    case "DISPATCHING":
      return "Dispatching";
    case "DISPATCHED":
      return "Scheduled for dispatch";
    case "IN_TRANSIT":
      return "In transit";
    case "COMPLETED":
      return "Completed";
    case "DISPATCH_FAILED":
      return "Dispatch failed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return String(status);
  }
}

/** Admin + shared tables: Prisma `OrderStatus` and legacy aliases. */
export function getAdminOrderStatusLabel(raw: unknown): string {
  const s = String(raw ?? "").trim();
  if (!s) return "—";
  const k = s.toUpperCase().replace(/-/g, "_").replace(/\s+/g, "_");

  const map: Record<string, string> = {
    PROCESSING: "Processing",
    ACCEPTED: "Accepted",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    IN_TRANSIT: "In transit",
    DELIVERED: "Delivered",
    ACTIVE: "Active (rental)",
    RETURN_DUE: "Return due",
    RETURN_PICKUP: "Return pickup",
    RETURNED: "Returned",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    REJECTED: "Rejected",
    IN_DISPUTE: "In dispute",
    DISPUTED: "In dispute",
  };

  return (
    map[k] ??
    s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}
