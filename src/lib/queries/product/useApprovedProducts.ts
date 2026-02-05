import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";

/**
 * Fetch approved products
 */
export const useApprovedProducts = (page: number = 1, count: number = 10) => {
  return useQuery({
    queryKey: ["products", "approved", page, count],
    queryFn: () => productApi.getApprovedProducts(page, count),
    retry: false,
  });
};
