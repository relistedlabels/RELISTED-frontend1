import type { ListingFilterValues } from "./listingFilters";

export function countActiveListingFilters(filters: ListingFilterValues): number {
  return (
    (filters.category?.length ?? 0) +
    (filters.tags?.length ?? 0) +
    (filters.brand?.length ?? 0) +
    (filters.lister?.length ?? 0) +
    (filters.listingTypes?.length ?? 0) +
    (filters.color?.length ?? 0) +
    (filters.size?.length ?? 0) +
    (filters.condition ? 1 : 0) +
    (filters.material ? 1 : 0) +
    (filters.minPrice !== undefined ? 1 : 0) +
    (filters.maxPrice !== undefined ? 1 : 0)
  );
}
