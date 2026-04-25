import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";
import { useFavoriteCountStore } from "@/store/useFavoriteCountStore";
import { useUserStore } from "@/store/useUserStore";

export const useFavorites = (
  page = 1,
  limit = 20,
  sort: "newest" | "oldest" | "price_low" | "price_high" = "newest",
) => {
  const setFavoriteCount = useFavoriteCountStore(
    (state) => state.setFavoriteCount,
  );
  const token = useUserStore((s) => s.token);
  const role = useUserStore((s) => s.role);
  const shouldFetch =
    token !== null && role !== null && role.toUpperCase() !== "ADMIN";

  return useQuery({
    queryKey: ["renters", "favorites", page, limit, sort],
    queryFn: async () => {
      const response = await rentersApi.getFavorites({ page, limit, sort });
      setFavoriteCount(response.data.totalFavorites);
      return response.data;
    },
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  const incrementFavoriteCount = useFavoriteCountStore(
    (state) => state.incrementFavoriteCount,
  );

  return useMutation({
    mutationFn: (itemId: string) => rentersApi.addFavorite(itemId),
    onMutate: () => {
      // Optimistic update
      incrementFavoriteCount();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["renters", "favorites"],
      });
      queryClient.invalidateQueries({
        queryKey: ["renters", "dashboard", "summary"],
      });
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();
  const decrementFavoriteCount = useFavoriteCountStore(
    (state) => state.decrementFavoriteCount,
  );

  return useMutation({
    mutationFn: (itemId: string) => rentersApi.removeFavorite(itemId),
    onMutate: () => {
      // Optimistic update
      decrementFavoriteCount();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["renters", "favorites"],
      });
      queryClient.invalidateQueries({
        queryKey: ["renters", "dashboard", "summary"],
      });
    },
  });
};
