import { useQuery } from "@tanstack/react-query";
import { getDisputeEvidence } from "@/lib/api/listers";

export function useDisputeEvidence(disputeId: string | undefined) {
  return useQuery({
    queryKey: ["listers", "disputes", "evidence", disputeId],
    queryFn: () => {
      if (!disputeId) throw new Error("disputeId is required");
      return getDisputeEvidence(disputeId);
    },
    enabled: !!disputeId,
    staleTime: 5 * 60 * 1000,
  });
}
