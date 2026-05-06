import { useMutation, useQueryClient } from "@tanstack/react-query";
import { passCartApi } from "@/lib/api/cart";
import type {
  DispatchWindowsPayload,
} from "@/lib/checkout/dispatchWindows";
import type { ReturnPickupAddressPayload } from "@/lib/api/cart";

type PassCartMutationInput = {
  tierName: string;
  dispatchWindows?: DispatchWindowsPayload;
  returnPickupAddress?: ReturnPickupAddressPayload;
};

export const usePassCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tierName, dispatchWindows, returnPickupAddress }: PassCartMutationInput) =>
      passCartApi({
        pricingTier: tierName,
        dispatchWindows,
        returnPickupAddress,
      }),
    onSuccess: () => {
      // Clear all cart-related caches
      queryClient.invalidateQueries({ queryKey: ["cart", "items"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["renters", "cart"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "cart", "summary"],
      });
      queryClient.invalidateQueries({ queryKey: ["renters", "orders"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "dashboard", "summary"],
      });
      queryClient.invalidateQueries({ queryKey: ["renters", "wallet"] });
      // Invalidate all rental request statuses to refresh cart display
      queryClient.invalidateQueries({ queryKey: ["renters", "rental-requests"] });
      // Also clear any pending cart items
      queryClient.clear();
    },
  });
};
