import { useQuery } from "@tanstack/react-query";
import {
  getOrderSummaryApi,
  type ReturnPickupAddressPayload,
} from "@/lib/api/cart";

export type DeliveryAddressSummaryKey = {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
};

/** Stable query key for checkout order summary (one fetch shared by checkout sections). */
export function checkoutOrderSummaryQueryKey(
  returnPickup?: ReturnPickupAddressPayload,
  delivery?: DeliveryAddressSummaryKey,
) {
  return [
    "orderSummary",
    delivery?.street ?? "",
    delivery?.city ?? "",
    delivery?.state ?? "",
    delivery?.zipCode ?? "",
    returnPickup?.street ?? "",
    returnPickup?.city ?? "",
    returnPickup?.state ?? "",
    returnPickup?.instructions ?? "",
  ] as const;
}

/** Single source of truth for GET /order/summary on checkout (tiers + breakdown). */
export function useCheckoutOrderSummary(
  returnPickup?: ReturnPickupAddressPayload,
  delivery?: DeliveryAddressSummaryKey,
) {
  return useQuery({
    queryKey: checkoutOrderSummaryQueryKey(returnPickup, delivery),
    queryFn: () =>
      getOrderSummaryApi({
        returnStreet: returnPickup?.street,
        returnCity: returnPickup?.city,
        returnState: returnPickup?.state,
        returnLandmark: returnPickup?.instructions,
      }),
    staleTime: 30_000,
    retry: 1,
  });
}
