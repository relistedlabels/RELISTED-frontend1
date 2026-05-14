import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";
import { useSearchParams } from "next/navigation";
import { matchesClosetDropsShopTitle } from "@/lib/nav/vaultClosetDropsShop";

export { CLOSET_DROPS_SHOP_TITLE, matchesClosetDropsShopTitle } from "@/lib/nav/vaultClosetDropsShop";

export const useProductsQuery = () => {
  const searchParams = useSearchParams();

  // Parse URL parameters
  const search = searchParams.get("search") || undefined;
  const category = searchParams.getAll("category");
  const tags = searchParams.get("tags") || undefined;
  const closetId = searchParams.get("closetId") || undefined;
  const shopTitle = searchParams.get("title");
  const isClosetDropsShop = matchesClosetDropsShopTitle(shopTitle);
  // Vault closet drops + no closetId: only products in any public closet. Explicit param still supported elsewhere.
  // When `closetId` is set, filter is that closet only — never send onlyWithCloset together (see productApi.getAll).
  const onlyWithClosetParam = searchParams.get("onlyWithCloset");
  const onlyWithCloset = Boolean(
    !closetId &&
      (onlyWithClosetParam === "true" ||
        onlyWithClosetParam === "1" ||
        isClosetDropsShop),
  );
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
        closetId,
        onlyWithCloset,
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
        closetId,
        onlyWithCloset,
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

      // Pagination matches the API: do not drop rows here (that used to hide
      // RENTED and skew page sizes vs totalPages).
      return {
        products: response.data.products,
        pagination: response.data.pagination,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return query;
};
