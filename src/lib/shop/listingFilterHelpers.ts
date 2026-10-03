import type { ReadonlyURLSearchParams } from "next/navigation";

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

export function listOrEmpty(value?: string[]): string[] {
  return value ?? [];
}

export function parseMultiSearchParam(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
  key: string,
): string[] {
  const params = searchParams as URLSearchParams;
  const all = params.getAll(key);
  if (all.length > 1) return all;
  const single = params.get(key);
  if (!single) return [];
  return single.split(",").map((value) => value.trim()).filter(Boolean);
}

export function normalizeListingFilters(
  filters: Partial<ListingFilterValues> = {},
): ListingFilterValues {
  return {
    search: filters.search,
    category: listOrEmpty(filters.category),
    tags: listOrEmpty(filters.tags),
    brand: listOrEmpty(filters.brand),
    lister: listOrEmpty(filters.lister),
    availability: listOrEmpty(filters.availability),
    listingTypes: listOrEmpty(filters.listingTypes),
    size: listOrEmpty(filters.size),
    color: listOrEmpty(filters.color),
    condition: filters.condition,
    material: filters.material,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    inCloset: filters.inCloset ?? "",
  };
}
