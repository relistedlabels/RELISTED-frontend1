import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";

/**
 * Fetch pending products awaiting admin review
 */
export const usePendingProducts = (page: number = 1, count: number = 10) => {
  return useQuery({
    queryKey: ["products", "pending", page, count],
    queryFn: () => productApi.getPendingProducts(page, count),
    retry: false,
  });
};
