import { useQuery } from "@tanstack/react-query";
import { getDisputeTimeline } from "@/lib/api/listers";

export function useDisputeTimeline(disputeId: string | undefined) {
  return useQuery({
    queryKey: ["listers", "disputes", "timeline", disputeId],
    queryFn: () => {
      if (!disputeId) throw new Error("disputeId is required");
      return getDisputeTimeline(disputeId);
    },
    enabled: !!disputeId,
    staleTime: 5 * 60 * 1000,
  });
}
