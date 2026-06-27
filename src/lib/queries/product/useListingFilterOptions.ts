import { useQuery } from "@tanstack/react-query";
import { adminShopSalesApi } from "@/lib/api/admin/shopSales";
import { productApi } from "@/lib/api/product";
import {
  EMPTY_LISTING_FILTER_OPTIONS,
  type ListingFilterOptions,
} from "@/lib/shop/listingFilterOptions";

export type ListingFilterOptionsScope = "shop" | "admin-picker";

export function useListingFilterOptions(params: {
  scope: ListingFilterOptionsScope;
  sale?: string;
  closetId?: string;
  onlyWithCloset?: boolean;
  enabled?: boolean;
}) {
  const { scope, sale, closetId, onlyWithCloset, enabled = true } = params;

  return useQuery<ListingFilterOptions>({
    queryKey: ["listing-filter-options", scope, sale, closetId, onlyWithCloset],
    queryFn: async () => {
      if (scope === "admin-picker") {
        const response = await adminShopSalesApi.getPickerFilterOptions();
        return response.data;
      }
      const response = await productApi.getFilterOptions({
        sale,
        closetId,
        onlyWithCloset,
      });
      return response.data;
    },
    placeholderData: EMPTY_LISTING_FILTER_OPTIONS,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled,
  });
}
