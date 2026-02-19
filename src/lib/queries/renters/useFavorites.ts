import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useFavorites = (
  page = 1,
  limit = 20,
  sort: "newest" | "oldest" | "price_low" | "price_high" = "newest",
) =>
  useQuery({
    queryKey: ["renters", "favorites", page, limit, sort],
    queryFn: async () => {
      const response = await rentersApi.getFavorites({ page, limit, sort });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
