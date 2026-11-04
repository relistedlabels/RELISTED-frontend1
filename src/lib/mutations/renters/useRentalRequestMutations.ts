import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";
import type { DispatchWindowsPayload } from "@/lib/checkout/dispatchWindows";
import { useOperationsPause } from "@/lib/queries/site/useOperationsPause";

/**
 * Submit a rental request (availability check)
 */
export const useSubmitRentalRequest = () => {
  const queryClient = useQueryClient();
  const { blockTransaction } = useOperationsPause();

  return useMutation({
    mutationFn: (data: {
      productId: string;
      listerId: string;
      rentalStartDate: string | null;
      rentalEndDate: string | null;
      rentalDays: number;
      estimatedRentalPrice: number;
      deliveryAddressId?: string;
      autoPay: boolean;
      currency: string;
      cartItemId?: string;
      dispatchWindows?: DispatchWindowsPayload;
    }) => {
      if (blockTransaction()) {
        return Promise.reject(new Error("operations_pause"));
      }
      return rentersApi.submitRentalRequest(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["renters", "rental-requests"],
      });
      queryClient.invalidateQueries({ queryKey: ["renters", "cart"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "cart", "summary"],
      });
      queryClient.invalidateQueries({ queryKey: ["cart", "items"] });
    },
  });
};
