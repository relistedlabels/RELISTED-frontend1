import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api/public";

export const usePublicProductById = (productId: string) =>
  useQuery({
    queryKey: ["public-product", productId],
    queryFn: async () => {
      const response = await publicApi.getProductById(productId);
      return response.data.product;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!productId,
  });
