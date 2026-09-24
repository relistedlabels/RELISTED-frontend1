import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";
import type { UserProduct } from "@/lib/api/product";

export const useSimilarProducts = (
  productId: string,
  options?: { limit?: number; enabled?: boolean },
) =>
  useQuery<UserProduct[]>({
    queryKey: ["similar-products", productId, options?.limit ?? 20],
    queryFn: async () => {
      const response = await productApi.getSimilar(
        productId,
        options?.limit ?? 20,
      );
      return response.data.products;
    },
    enabled: Boolean(productId) && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
