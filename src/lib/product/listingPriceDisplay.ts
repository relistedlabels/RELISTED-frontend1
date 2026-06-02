export type ListingType = "RENTAL" | "RESALE" | "RENT_OR_RESALE";

export function normalizeListingType(
  listingType?: string | null,
): ListingType {
  const raw = (listingType ?? "RENTAL").toUpperCase();
  if (raw === "RESALE") return "RESALE";
  if (raw === "RENT_OR_RESALE" || raw === "RENT-RESALE") {
    return "RENT_OR_RESALE";
  }
  return "RENTAL";
}

type PriceLine = { label: string; amount: number };

export function listingPriceDisplay(p: {
  listingType?: string | null;
  dailyPrice?: number | null;
  resalePrice?: number | null;
}): {
  listingType: ListingType;
  primary: PriceLine;
  secondary: PriceLine | null;
} {
  const listingType = normalizeListingType(p.listingType);

  if (listingType === "RESALE") {
    return {
      listingType,
      primary: { label: "Resale Price", amount: p.resalePrice ?? 0 },
      secondary: null,
    };
  }

  if (listingType === "RENT_OR_RESALE") {
    return {
      listingType,
      primary: { label: "Rent price", amount: p.dailyPrice ?? 0 },
      secondary: { label: "Resale", amount: p.resalePrice ?? 0 },
    };
  }

  return {
    listingType,
    primary: { label: "Price/Day", amount: p.dailyPrice ?? 0 },
    secondary: null,
  };
}
