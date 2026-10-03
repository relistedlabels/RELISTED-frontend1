import type { ReadonlyURLSearchParams } from "next/navigation";
import { countActiveListingFilters } from "./countActiveListingFilters";
import {
  type ListingFilterValues,
  listingFiltersFromSearchParams,
  parseMultiSearchParam,
} from "./listingFilters";

export type ShopSortValue =
  | "newest"
  | "popular"
  | "price_low"
  | "price_high";

export const SHOP_SORT_OPTIONS: { value: ShopSortValue; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most popular" },
  { value: "price_low", label: "Price: low to high" },
  { value: "price_high", label: "Price: high to low" },
];

export const RENT_LISTING_TYPES = "RENTAL,RENT_OR_RESALE";
export const BUY_LISTING_TYPES = "RESALE,RENT_OR_RESALE";

export function shopSortFromSearchParams(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): ShopSortValue {
  const sort = searchParams.get("sort");
  if (
    sort === "popular" ||
    sort === "price_low" ||
    sort === "price_high" ||
    sort === "price_asc"
  ) {
    return sort === "price_asc" ? "price_low" : sort;
  }
  if (sort === "price_desc") return "price_high";
  return "newest";
}

export function isShopRentMode(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): boolean {
  const listingType = searchParams.get("listingType") ?? "";
  if (!listingType) return true;
  return listingType.startsWith("RENTAL");
}

/** Listing types for shop API calls (URL param or Rent/Buy default). */
export function shopListingTypesParam(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): string {
  const fromUrl = searchParams.get("listingType");
  if (fromUrl) return fromUrl;
  return isShopRentMode(searchParams)
    ? RENT_LISTING_TYPES
    : BUY_LISTING_TYPES;
}

export function isShopDefaultSort(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): boolean {
  return shopSortFromSearchParams(searchParams) === "newest";
}

export function countShopDiscoveryFilters(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): number {
  const filters = listingFiltersFromSearchParams(searchParams);
  return (
    (filters.category?.length ?? 0) +
    (filters.tags?.length ?? 0) +
    (filters.brand?.length ?? 0) +
    (filters.lister?.length ?? 0) +
    (filters.size?.length ?? 0) +
    (filters.color?.length ?? 0) +
    (filters.condition ? 1 : 0) +
    (filters.material ? 1 : 0) +
    (filters.minPrice !== undefined ? 1 : 0) +
    (filters.maxPrice !== undefined ? 1 : 0) +
    (filters.search ? 1 : 0)
  );
}

/** Keep campaign / brand / tag headings when stacking category or panel filters. */
export function shouldPreserveShopHeading(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): boolean {
  if (searchParams.get("sale")) return true;
  if (searchParams.get("closetId")) return true;
  if (searchParams.get("onlyWithCloset") === "true") return true;

  const filters = listingFiltersFromSearchParams(searchParams);
  if ((filters.tags?.length ?? 0) > 0) return true;
  if ((filters.brand?.length ?? 0) > 0) return true;
  if ((filters.lister?.length ?? 0) > 0) return true;
  return false;
}

/** Drop category-only title/description when no discovery filters remain. */
export function syncShopHeadingParams(params: URLSearchParams): void {
  if (shouldPreserveShopHeading(params)) return;
  if (countShopDiscoveryFilters(params) === 0) {
    params.delete("title");
    params.delete("description");
  }
}

/** Browse rails show when no product-discovery filters are active (Rent/Buy mode alone is OK). */
export function isShopBrowseMode(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): boolean {
  if (countShopDiscoveryFilters(searchParams) > 0) return false;
  if (searchParams.get("sale")) return false;
  if (searchParams.get("title")) return false;
  if (searchParams.get("closetId")) return false;
  if (searchParams.get("onlyWithCloset") === "true") return false;
  return true;
}

export function countShopPanelFilters(filters: ListingFilterValues): number {
  return countActiveListingFilters({
    ...filters,
    listingTypes: [],
  });
}

export type ShopFilterChip = {
  key: string;
  label: string;
  removeKeys: string[];
  removeValue?: string;
};

export function buildShopFilterChips(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
  categoryNames: Map<string, string>,
): ShopFilterChip[] {
  const chips: ShopFilterChip[] = [];
  const filters = listingFiltersFromSearchParams(searchParams);

  if (filters.search?.trim()) {
    chips.push({
      key: "search",
      label: `"${filters.search.trim()}"`,
      removeKeys: ["search"],
    });
  }

  for (const categoryId of filters.category ?? []) {
    chips.push({
      key: `category-${categoryId}`,
      label: categoryNames.get(categoryId) ?? "Category",
      removeKeys: ["category"],
      removeValue: categoryId,
    });
  }

  for (const tag of filters.tags ?? []) {
    chips.push({
      key: `tag-${tag}`,
      label: tag,
      removeKeys: ["tags"],
      removeValue: tag,
    });
  }

  for (const brand of filters.brand ?? []) {
    chips.push({
      key: `brand-${brand}`,
      label: brand,
      removeKeys: ["brand"],
      removeValue: brand,
    });
  }

  for (const size of filters.size ?? []) {
    chips.push({
      key: `size-${size}`,
      label: `Size ${size}`,
      removeKeys: ["size"],
      removeValue: size,
    });
  }

  for (const color of filters.color ?? []) {
    chips.push({
      key: `color-${color}`,
      label: color,
      removeKeys: ["color"],
      removeValue: color,
    });
  }

  if (filters.condition) {
    chips.push({
      key: "condition",
      label: filters.condition,
      removeKeys: ["condition"],
    });
  }

  if (filters.material) {
    chips.push({
      key: "material",
      label: filters.material,
      removeKeys: ["material"],
    });
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const min = filters.minPrice;
    const max = filters.maxPrice;
    const label =
      min !== undefined && max !== undefined
        ? `₦${min.toLocaleString()} – ₦${max.toLocaleString()}`
        : min !== undefined
          ? `From ₦${min.toLocaleString()}`
          : `Up to ₦${(max ?? 0).toLocaleString()}`;
    chips.push({
      key: "price",
      label,
      removeKeys: ["minPrice", "maxPrice"],
    });
  }

  const sale = searchParams.get("sale");
  if (sale) {
    chips.push({
      key: "sale",
      label: searchParams.get("title")?.trim() || "Sale",
      removeKeys: ["sale", "title", "description"],
    });
  }

  return chips;
}

export function removeShopFilterChip(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
  chip: ShopFilterChip,
): URLSearchParams {
  const next = new URLSearchParams(searchParams.toString());

  if (chip.removeValue && chip.removeKeys.length === 1) {
    const key = chip.removeKeys[0]!;
    next.delete(key);
    if (key === "tags" || key === "color" || key === "size") {
      const remaining = parseMultiSearchParam(searchParams, key).filter(
        (value) => value !== chip.removeValue,
      );
      if (remaining.length > 0) {
        next.set(key, remaining.join(","));
      }
    } else {
      const values = searchParams
        .getAll(key)
        .filter((value) => value !== chip.removeValue);
      values.forEach((value) => next.append(key, value));
    }
  } else {
    chip.removeKeys.forEach((key) => next.delete(key));
  }

  next.delete("page");
  syncShopHeadingParams(next);
  return next;
}

export function shopResultCountLabel(
  total: number,
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): string {
  if (total === 0) return "No items found";
  const noun = total === 1 ? "item" : "items";
  const mode = isShopRentMode(searchParams) ? "for rent" : "for sale";
  const hasListingMode = Boolean(searchParams.get("listingType"));
  if (hasListingMode && isShopBrowseMode(searchParams)) {
    return `${total.toLocaleString()} ${noun} ${mode}`;
  }
  return `${total.toLocaleString()} ${noun}`;
}
