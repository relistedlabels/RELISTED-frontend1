import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      orderId: string;
      rating: number;
      comment?: string;
    }) => rentersApi.submitReview(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["renters", "orders"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "orders", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["public-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["public-user-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["public-product-reviews"] });
    },
  });
}
