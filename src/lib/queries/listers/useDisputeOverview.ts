import { useQuery } from "@tanstack/react-query";
import { getDisputeOverview } from "@/lib/api/listers";

export function useDisputeOverview(disputeId: string | undefined) {
  return useQuery({
    queryKey: ["listers", "disputes", "overview", disputeId],
    queryFn: () => {
      if (!disputeId) throw new Error("disputeId is required");
      return getDisputeOverview(disputeId);
    },
    enabled: !!disputeId,
    staleTime: 5 * 60 * 1000,
  });
}
