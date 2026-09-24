import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api/public";

export const useProductReviews = (
  productId: string,
  params?: {
    page?: number;
    limit?: number;
    sort?: "newest" | "oldest" | "rating_high" | "rating_low";
  },
) =>
  useQuery({
    queryKey: ["public-product-reviews", productId, params],
    queryFn: async () => {
      const response = await publicApi.getProductReviews(productId, params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: Boolean(productId),
  });
