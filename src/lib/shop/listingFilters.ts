const AVAILABILITY_TO_LISTING_TYPE: Record<string, string> = {
  Rent: "RENTAL",
  Resale: "RESALE",
  "Rent & Resale": "RENT_OR_RESALE",
};

export function listOrEmpty(value?: string[]): string[] {
  return value ?? [];
}

export function availabilityToListingTypes(
  availability?: string[],
): string[] | undefined {
  const items = listOrEmpty(availability);
  if (items.length === 0) return undefined;
  const types = items
    .map((item) => AVAILABILITY_TO_LISTING_TYPE[item])
    .filter(Boolean);
  return types.length > 0 ? types : undefined;
}

export type ListingFilterValues = {
  search?: string;
  category?: string[];
  tags?: string[];
  brand?: string[];
  lister?: string[];
  /** @deprecated Legacy URL param; use listingTypes instead */
  availability?: string[];
  listingTypes?: string[];
  size?: string[];
  color?: string[];
  condition?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  inCloset?: "" | "true" | "false";
};

function parseMultiSearchParam(
  searchParams: URLSearchParams,
  key: string,
): string[] {
  const all = searchParams.getAll(key);
  if (all.length > 1) return all;
  const single = searchParams.get(key);
  if (!single) return [];
  return single.split(",").map((value) => value.trim()).filter(Boolean);
}

export function appendListingFiltersToParams(
  params: URLSearchParams,
  filters: ListingFilterValues,
) {
  if (filters.search) params.set("search", filters.search);
  listOrEmpty(filters.category).forEach((cat) => params.append("category", cat));
  const tags = listOrEmpty(filters.tags);
  if (tags.length > 0) params.set("tags", tags.join(","));
  listOrEmpty(filters.brand).forEach((brand) => params.append("brand", brand));
  listOrEmpty(filters.lister).forEach((id) => params.append("lister", id));
  const sizes = listOrEmpty(filters.size);
  if (sizes.length > 0) params.set("size", sizes.join(","));
  const colors = listOrEmpty(filters.color);
  if (colors.length > 0) params.set("color", colors.join(","));
  if (filters.condition) params.set("condition", filters.condition);
  if (filters.material) params.set("material", filters.material);
  const availability = listOrEmpty(filters.availability);
  if (availability.length > 0) {
    params.set("availability", availability.join(","));
  }
  const listingTypes = listOrEmpty(filters.listingTypes);
  if (listingTypes.length > 0) {
    params.set("listingType", listingTypes.join(","));
  }
  if (filters.minPrice !== undefined) {
    params.set("minPrice", String(filters.minPrice));
  }
  if (filters.maxPrice !== undefined) {
    params.set("maxPrice", String(filters.maxPrice));
  }
  if (filters.inCloset) params.set("inCloset", filters.inCloset);
}

export function listingFiltersFromSearchParams(
  searchParams: URLSearchParams,
): ListingFilterValues {
  return {
    search: searchParams.get("search") || undefined,
    category: searchParams.getAll("category"),
    tags: searchParams.get("tags") ? searchParams.get("tags")!.split(",") : [],
    brand: searchParams.getAll("brand"),
    lister: searchParams.getAll("lister"),
    availability: searchParams.get("availability")
      ? searchParams.get("availability")!.split(",")
      : [],
    listingTypes: searchParams.get("listingType")
      ? searchParams.get("listingType")!.split(",")
      : [],
    size: parseMultiSearchParam(searchParams, "size"),
    color: parseMultiSearchParam(searchParams, "color"),
    condition: searchParams.get("condition") || undefined,
    material: searchParams.get("material") || undefined,
    minPrice: searchParams.get("minPrice")
      ? parseInt(searchParams.get("minPrice")!, 10)
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? parseInt(searchParams.get("maxPrice")!, 10)
      : undefined,
    inCloset: (searchParams.get("inCloset") as "" | "true" | "false") || "",
  };
}

export function mergePreservedShopParams(
  target: URLSearchParams,
  from: URLSearchParams,
) {
  for (const key of ["title", "description", "sale"] as const) {
    const v = from.get(key);
    if (v) target.set(key, v);
  }
}

export function pickerFiltersToApiParams(filters: ListingFilterValues) {
  const listingFromAvailability = availabilityToListingTypes(
    filters.availability,
  );
  const listingTypes = [
    ...listOrEmpty(filters.listingTypes),
    ...(listingFromAvailability ?? []),
  ];
  const uniqueListingTypes = [...new Set(listingTypes)];
  const category = listOrEmpty(filters.category);
  const brand = listOrEmpty(filters.brand);
  const tags = listOrEmpty(filters.tags);
  const lister = listOrEmpty(filters.lister);
  const sizes = listOrEmpty(filters.size);
  const colors = listOrEmpty(filters.color);

  return {
    category: category.length > 0 ? category.join(",") : undefined,
    brand: brand.length > 0 ? brand : undefined,
    tags: tags.length > 0 ? tags.join(",") : undefined,
    listingType:
      uniqueListingTypes.length > 0 ? uniqueListingTypes.join(",") : undefined,
    lister: lister.length > 0 ? lister : undefined,
    color: colors.length > 0 ? colors.join(",") : undefined,
    size: sizes.length > 0 ? sizes.join(",") : undefined,
    condition: filters.condition,
    material: filters.material,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    inCloset:
      filters.inCloset === "true"
        ? true
        : filters.inCloset === "false"
          ? false
          : undefined,
  };
}
