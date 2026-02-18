import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api/public";

export const usePublicUserProducts = (
  userId: string,
  params?: {
    page?: number;
    limit?: number;
    sort?: "newest" | "price_low" | "price_high" | "rating";
    category?: string;
    search?: string;
  },
) =>
  useQuery({
    queryKey: ["public-user-products", userId, params],
    queryFn: async () => {
      const response = await publicApi.getUserProducts(userId, params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!userId,
  });
