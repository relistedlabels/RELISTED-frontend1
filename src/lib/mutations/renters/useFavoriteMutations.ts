import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useAddFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => rentersApi.addFavorite(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renters", "favorites"] });
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => rentersApi.removeFavorite(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renters", "favorites"] });
    },
  });
};
