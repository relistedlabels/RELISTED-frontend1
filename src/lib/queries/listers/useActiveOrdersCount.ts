import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/lib/api/listers";
import { useUserStore } from "@/store/useUserStore";

export function useActiveOrdersCount() {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["listers", "orders", "in-progress-count"],
    queryFn: async () => {
      const response = await getOrders(undefined, 1, 1);
      const payload = response.data;
      if (Array.isArray(payload)) return 0;
      const summary = payload.summary;
      return (summary?.ongoingCount ?? 0) + (summary?.inDisputeCount ?? 0);
    },
    enabled: token !== null,
    refetchInterval: token !== null ? 30 * 1000 : false,
    refetchIntervalInBackground: false,
    staleTime: 30 * 1000,
    retry: 1,
  });
}
