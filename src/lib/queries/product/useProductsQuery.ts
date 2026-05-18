import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";
import { useSearchParams } from "next/navigation";

export { CLOSET_DROPS_SHOP_TITLE, matchesClosetDropsShopTitle } from "@/lib/nav/vaultClosetDropsShop";

/** Closet drops are disabled on the main shop; always exclude closet inventory. */
const ONLY_WITH_CLOSET = false;

export const useProductsQuery = () => {
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || undefined;
  const category = searchParams.getAll("category");
  const tags = searchParams.get("tags") || undefined;
  const brand = searchParams.getAll("brand");
  const size = searchParams.get("size") || undefined;
  const minPrice = searchParams.get("minPrice")
    ? parseInt(searchParams.get("minPrice")!)
    : undefined;
  const maxPrice = searchParams.get("maxPrice")
    ? parseInt(searchParams.get("maxPrice")!)
    : undefined;
  const color = searchParams.get("color") || undefined;
  const condition = searchParams.get("condition") || undefined;
  const material = searchParams.get("material") || undefined;
  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page")!)
    : 1;

  const query = useQuery<any, Error, { products: any[]; pagination?: any }>({
    queryKey: [
      "products",
      {
        search,
        category,
        tags,
        onlyWithCloset: ONLY_WITH_CLOSET,
        brand,
        size,
        minPrice,
        maxPrice,
        color,
        condition,
        material,
        page,
      },
    ],
    queryFn: async () => {
      const response = await productApi.getAll({
        search,
        category: category.length > 0 ? category : undefined,
        tags,
        onlyWithCloset: ONLY_WITH_CLOSET,
        brand: brand.length > 0 ? brand : undefined,
        size,
        minPrice,
        maxPrice,
        color,
        condition,
        material,
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
