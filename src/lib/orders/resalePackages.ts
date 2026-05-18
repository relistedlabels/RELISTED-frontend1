/** Package row from GET order detail or GET order progress. */
export type RenterResalePackageRow = {
  shipmentId: string;
  listerId?: string | null;
  listerName?: string | null;
  itemLabel: string;
  itemNames?: string[];
  status: string;
  scheduledDate?: string | null;
  windowSummary?: string | null;
  trackingId?: string | null;
  providerTrackingUrl?: string | null;
  isDelivered?: boolean;
  isBooked?: boolean;
};

export function resalePurchaseItemNames(
  order: Record<string, unknown> | null | undefined,
): string[] {
  if (!order) return [];
  const items = (order.items ?? order.orderItems) as
    | Array<Record<string, unknown>>
    | undefined;
  if (!items?.length) return [];
  return items
    .filter((row) => {
      const days = Number(row.days ?? row.rentalDays ?? 0);
      const lt = String(row.listingType ?? "").trim();
      return lt === "RESALE" || (lt === "RENT_OR_RESALE" && days === 0);
    })
    .map((row) => String(row.name ?? "Item").trim())
    .filter(Boolean);
}

export function resolveRentalPackages(
  order: Record<string, unknown> | null | undefined,
  progress?: {
    outboundLegs?: RenterResalePackageRow[];
    rentalLegs?: RenterResalePackageRow[];
  } | null,
): RenterResalePackageRow[] {
  const fromProgress = progress?.rentalLegs?.length
    ? progress.rentalLegs
    : progress?.outboundLegs?.length
      ? progress.outboundLegs
      : undefined;
  if (fromProgress?.length) {
    return fromProgress.map((row) => ({
      ...row,
      itemLabel: row.itemLabel ?? row.itemNames?.join(", ") ?? "Rental items",
      itemNames: row.itemNames?.length
        ? row.itemNames
        : [row.itemLabel ?? "Rental items"],
    }));
  }

  const fromOrder = order?.rentalPackages as RenterResalePackageRow[] | undefined;
  if (fromOrder?.length) return fromOrder;

  const names = (order?.items ?? order?.orderItems) as
    | Array<Record<string, unknown>>
    | undefined;
  const rentalNames =
    names
      ?.filter((row) => {
        const days = Number(row.days ?? row.rentalDays ?? 0);
        const lt = String(row.listingType ?? "").trim();
        return days > 0 && (lt === "RENTAL" || lt === "RENT_OR_RESALE");
      })
      .map((row) => String(row.name ?? "Item").trim())
      .filter(Boolean) ?? [];

  const shipments = (order?.shipments ?? []) as Array<{
    id?: string;
    type?: string;
    status?: string;
    trackingId?: string | null;
    providerTrackingUrl?: string | null;
    listerName?: string | null;
    windowSummary?: string | null;
    scheduledDate?: string | null;
  }>;

  const outbound = shipments.filter((s) => s.type === "OUTBOUND");
  if (outbound.length > 0) {
    return outbound.map((s, index) => ({
      shipmentId: String(s.id ?? `out-${index}`),
      listerName: s.listerName ?? null,
      itemLabel: rentalNames.length ? rentalNames.join(", ") : "Rental items",
      itemNames: rentalNames.length ? rentalNames : ["Rental items"],
      status: String(s.status ?? "PENDING"),
      scheduledDate: s.scheduledDate ?? null,
      windowSummary: s.windowSummary ?? null,
      trackingId: s.trackingId ?? null,
      providerTrackingUrl: s.providerTrackingUrl ?? null,
      isDelivered: s.status === "COMPLETED",
      isBooked: ["DISPATCHING", "DISPATCHED", "IN_TRANSIT", "COMPLETED"].includes(
        String(s.status ?? ""),
      ),
    }));
  }

  if (!rentalNames.length) return [];

  return rentalNames.map((name, index) => ({
    shipmentId: `rental-${index}`,
    itemLabel: name,
    itemNames: [name],
    status: "PENDING",
    listerName: null,
    scheduledDate: null,
    windowSummary: null,
    trackingId: null,
    providerTrackingUrl: null,
    isDelivered: false,
    isBooked: false,
  }));
}

export function resolveResalePackages(
  order: Record<string, unknown> | null | undefined,
  progress?: {
    resaleLegs?: RenterResalePackageRow[];
  } | null,
): RenterResalePackageRow[] {
  const fromProgress = progress?.resaleLegs;
  if (fromProgress?.length) return fromProgress;

  const fromOrder = order?.packages as RenterResalePackageRow[] | undefined;
  if (fromOrder?.length) return fromOrder;

  const names = resalePurchaseItemNames(order);
  if (!names.length) return [];

  const shipments = (order?.shipments ?? []) as Array<{
    id?: string;
    type?: string;
    status?: string;
    trackingId?: string | null;
    providerTrackingUrl?: string | null;
    listerName?: string | null;
    windowSummary?: string | null;
    scheduledDate?: string | null;
  }>;

  const resaleShipments = shipments.filter((s) => s.type === "RESALE");
  if (resaleShipments.length > 0) {
    return resaleShipments.map((s, index) => ({
      shipmentId: String(s.id ?? `ship-${index}`),
      listerName: s.listerName ?? null,
      itemLabel: names.length === 1 ? names[0] : names.join(", "),
      itemNames: names,
      status: String(s.status ?? "PENDING"),
      scheduledDate: s.scheduledDate ?? null,
      windowSummary: s.windowSummary ?? null,
      trackingId: s.trackingId ?? null,
      providerTrackingUrl: s.providerTrackingUrl ?? null,
      isDelivered: s.status === "COMPLETED",
      isBooked: ["DISPATCHING", "DISPATCHED", "IN_TRANSIT", "COMPLETED"].includes(
        String(s.status ?? ""),
      ),
    }));
  }

  return names.map((name, index) => ({
    shipmentId: `item-${index}`,
    itemLabel: name,
    itemNames: [name],
    status: "PENDING",
    listerName: null,
    scheduledDate: null,
    windowSummary: null,
    trackingId: null,
    providerTrackingUrl: null,
    isDelivered: false,
    isBooked: false,
  }));
}
