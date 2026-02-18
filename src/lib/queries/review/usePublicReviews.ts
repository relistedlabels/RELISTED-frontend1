import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api/public";

export const usePublicReviews = (params?: {
  minRating?: number;
  limit?: number;
  sort?: "newest" | "oldest" | "helpful";
  type?: "product" | "lister" | "general";
}) =>
  useQuery({
    queryKey: ["public-reviews", params],
    queryFn: async () => {
      const response = await publicApi.getReviews(params);
      return response.data.reviews;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
