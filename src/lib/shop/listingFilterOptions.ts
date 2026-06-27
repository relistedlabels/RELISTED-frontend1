export type ListingFilterOptions = {
  colors: string[];
  sizes: string[];
  conditions: string[];
  materials: string[];
  listingTypes: Array<{ value: string; label: string }>;
  brands: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string }>;
  listers: Array<{ id: string; name: string }>;
};

export const EMPTY_LISTING_FILTER_OPTIONS: ListingFilterOptions = {
  colors: [],
  sizes: [],
  conditions: [],
  materials: [],
  listingTypes: [],
  brands: [],
  categories: [],
  tags: [],
  listers: [],
};
