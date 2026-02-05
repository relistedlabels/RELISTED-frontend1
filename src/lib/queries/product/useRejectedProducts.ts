import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";

/**
 * Fetch rejected products
 */
export const useRejectedProducts = (page: number = 1, count: number = 10) => {
  return useQuery({
    queryKey: ["products", "rejected", page, count],
    queryFn: () => productApi.getRejectedProducts(page, count),
    retry: false,
  });
};
