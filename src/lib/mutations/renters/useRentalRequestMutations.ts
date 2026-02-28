import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

/**
 * Submit a rental request (availability check)
 */
export const useSubmitRentalRequest = () => {
  const queryClient = useQueryClient();

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
