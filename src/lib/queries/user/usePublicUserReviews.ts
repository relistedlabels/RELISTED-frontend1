import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api/public";

export const usePublicUserReviews = (
  userId: string,
  params?: {
    page?: number;
    limit?: number;
    sort?: "newest" | "oldest" | "rating_high" | "rating_low";
  },
) =>
  useQuery({
    queryKey: ["public-user-reviews", userId, params],
    queryFn: async () => {
      const response = await publicApi.getUserReviews(userId, params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!userId,
  });
