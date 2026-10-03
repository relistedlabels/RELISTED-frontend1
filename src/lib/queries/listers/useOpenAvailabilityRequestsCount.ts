import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/lib/api/listers";
import { isListerAvailabilityRequestRow } from "@/lib/listers/listerOrderRow";
import {
  getListerOrderStatusLabel,
  isListerAvailabilityPending,
  normalizeListerOrderStatusKey,
} from "@/lib/listers/listerOrderStatus";
import { useUserStore } from "@/store/useUserStore";

function needsAttention(order: Record<string, unknown>): boolean {
  if (isListerAvailabilityPending(order)) return true;

  const statusKey = normalizeListerOrderStatusKey(
    String(
      order.availabilityStatus ?? order.availability_status ?? order.status ?? "",
    ),
  );
  if (statusKey === "AWAITING_PAYMENT") return true;

  return getListerOrderStatusLabel(order) === "Awaiting renter payment";
}

export function useOpenAvailabilityRequestsCount() {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["listers", "availability-requests", "open-count"],
    queryFn: async () => {
      const response = await getOrders(undefined, 1, 100);
      const payload = response.data;
      const rows: Record<string, unknown>[] = Array.isArray(payload)
        ? payload
        : (payload.orders ?? []);
      return rows.filter(
        (order) =>
          isListerAvailabilityRequestRow(order) && needsAttention(order),
      ).length;
    },
    enabled: token !== null,
    refetchInterval: token !== null ? 30 * 1000 : false,
    refetchIntervalInBackground: false,
    staleTime: 30 * 1000,
    retry: 1,
  });
}
