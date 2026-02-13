import { useQuery } from "@tanstack/react-query";
import { getDisputeResolution } from "@/lib/api/listers";

export function useDisputeResolution(disputeId: string | undefined) {
  return useQuery({
    queryKey: ["listers", "disputes", "resolution", disputeId],
    queryFn: () => {
      if (!disputeId) throw new Error("disputeId is required");
      return getDisputeResolution(disputeId);
    },
    enabled: !!disputeId,
    staleTime: 5 * 60 * 1000,
  });
}
