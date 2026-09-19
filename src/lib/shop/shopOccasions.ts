import { categories as occasionCatalog } from "@/data/categoryData";
import type { ListingFilterOptions } from "./listingFilterOptions";

export type ShopOccasionTile = {
  title: string;
  description: string;
  image: string;
  tag: string;
};

function normalizeTagName(value: string): string {
  return value.trim().toLowerCase();
}

/** Occasion tiles backed by tags that actually appear in shop inventory. */
export function shopOccasionsFromFilterOptions(
  filterOptions: ListingFilterOptions,
): ShopOccasionTile[] {
  const availableTags = new Set(
    filterOptions.tags.map((tag) => normalizeTagName(tag.name)),
  );
  if (availableTags.size === 0) return [];

  return occasionCatalog
    .filter((entry) => {
      const key = normalizeTagName(entry.filterValue ?? entry.title);
      return availableTags.has(key);
    })
    .map((entry) => ({
      title: entry.title,
      description: entry.description,
      image: entry.image,
      tag: entry.filterValue ?? entry.title,
    }));
}
