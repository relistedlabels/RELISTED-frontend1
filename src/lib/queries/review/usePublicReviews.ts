import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api/public";

export const usePublicReviews = (params?: {
  minRating?: number;
  limit?: number;
  sort?: "newest" | "oldest" | "helpful" | "rating_high" | "rating_low";
  productId?: string;
  curatorId?: string;
  page?: number;
}) =>
  useQuery({
    queryKey: ["public-reviews", params],
    queryFn: async () => {
      const response = await publicApi.getReviews(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
