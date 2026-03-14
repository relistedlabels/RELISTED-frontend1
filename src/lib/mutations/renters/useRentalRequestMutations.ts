import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";
import { useCartCountStore } from "@/store/useCartCountStore";

/**
 * Submit a rental request (availability check)
 */
export const useSubmitRentalRequest = () => {
  const queryClient = useQueryClient();
  const incrementCartCount = useCartCountStore(
    (state) => state.incrementCartCount,
  );

  return useMutation({
    mutationFn: (data: {
      productId: string;
      listerId: string;
      rentalStartDate: string;
      rentalEndDate: string;
      rentalDays: number;
      estimatedRentalPrice: number;
      deliveryAddressId: string;
      autoPay: boolean;
      currency: string;
    }) => rentersApi.submitRentalRequest(data),
    onSuccess: () => {
      // Optimistically increment cart count
      incrementCartCount(1);

      queryClient.invalidateQueries({
        queryKey: ["renters", "rental-requests"],
      });
      queryClient.invalidateQueries({ queryKey: ["renters", "cart"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "cart", "summary"],
      });
    },
  });
};
