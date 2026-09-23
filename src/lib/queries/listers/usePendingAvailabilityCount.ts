import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/lib/api/listers";
import { useUserStore } from "@/store/useUserStore";

export function usePendingAvailabilityCount() {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["listers", "orders", "pending", "count"],
    queryFn: async () => {
      const response = await getOrders("pending", 1, 1);
      const payload = response.data;
      const summary = Array.isArray(payload)
        ? undefined
        : payload.summary;
      return summary?.pendingApprovalCount ?? 0;
    },
    enabled: token !== null,
    refetchInterval: token !== null ? 30 * 1000 : false,
    refetchIntervalInBackground: false,
    staleTime: 30 * 1000,
    retry: 1,
  });
}
