import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";

export type UserProductsFilters = {
  closetId?: string;
  uncategorized?: boolean;
};

export const useUserProducts = (
  filters?: UserProductsFilters,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ["user-products", filters ?? {}],
    queryFn: async () => {
      const response = await productApi.getUserProducts(filters);
      return response.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
