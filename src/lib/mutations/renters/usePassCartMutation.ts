import { useMutation, useQueryClient } from "@tanstack/react-query";
import { passCartApi } from "@/lib/api/cart";
import type {
  DispatchWindowsPayload,
} from "@/lib/checkout/dispatchWindows";
import type { ReturnPickupAddressPayload } from "@/lib/api/cart";

type PassCartMutationInput = {
  tierName: string;
  returnTierName?: string;
  outboundPricingByBucket?: Array<{ bucketIndex: number; pricingTier: string }>;
  returnPricingByBucket?: Array<{ bucketIndex: number; pricingTier: string }>;
  dispatchWindows?: DispatchWindowsPayload;
  returnPickupAddress?: ReturnPickupAddressPayload;
};

export const usePassCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tierName,
      returnTierName,
      outboundPricingByBucket,
      returnPricingByBucket,
      dispatchWindows,
      returnPickupAddress,
    }: PassCartMutationInput) =>
      passCartApi({
        pricingTier: tierName,
        ...(returnTierName != null && returnTierName !== ""
          ? { returnPricingTier: returnTierName }
          : {}),
        ...(outboundPricingByBucket != null && outboundPricingByBucket.length > 0
          ? { outboundPricingByBucket }
          : {}),
        ...(returnPricingByBucket != null && returnPricingByBucket.length > 0
          ? { returnPricingByBucket }
          : {}),
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
