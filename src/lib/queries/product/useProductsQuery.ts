import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";
import { useSearchParams } from "next/navigation";
import {
  listingFiltersFromSearchParams,
  pickerFiltersToApiParams,
} from "@/lib/shop/listingFilters";

export { CLOSET_DROPS_SHOP_TITLE, matchesClosetDropsShopTitle } from "@/lib/nav/vaultClosetDropsShop";

/** Closet drops are disabled on the main shop; always exclude closet inventory. */
const ONLY_WITH_CLOSET = false;

export const useProductsQuery = () => {
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || undefined;
  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page")!)
    : 1;
  const sale = searchParams.get("sale") || undefined;
  const onlyWithCloset = sale ? undefined : ONLY_WITH_CLOSET;

  const listingFilters = pickerFiltersToApiParams(
    listingFiltersFromSearchParams(searchParams),
  );

  const query = useQuery<any, Error, { products: any[]; pagination?: any }>({
    queryKey: [
      "products",
      {
        search,
        sale,
        onlyWithCloset,
        page,
        ...listingFilters,
      },
    ],
    queryFn: async () => {
      const response = await productApi.getAll({
        search,
        category: listingFilters.category
          ? listingFilters.category.split(",")
          : undefined,
        tags: listingFilters.tags,
        sale,
        onlyWithCloset,
        brand: listingFilters.brand,
        listingType: listingFilters.listingType,
        lister: listingFilters.lister,
        size: listingFilters.size,
        minPrice: listingFilters.minPrice,
        maxPrice: listingFilters.maxPrice,
        color: listingFilters.color,
        condition: listingFilters.condition,
        material: listingFilters.material,
        page,
        limit: 15,
      });

      return {
        products: response.data.products,
        pagination: response.data.pagination,
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return query;
};
