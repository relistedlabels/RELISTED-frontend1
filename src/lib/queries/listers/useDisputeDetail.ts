import { useQuery } from "@tanstack/react-query";
import { getDisputeDetail } from "@/lib/api/listers";

export function useDisputeDetail(disputeId: string | undefined) {
  return useQuery({
    queryKey: ["listers", "disputes", "detail", disputeId],
    queryFn: () => {
      if (!disputeId) throw new Error("disputeId is required");
      return getDisputeDetail(disputeId);
    },
    enabled: !!disputeId,
    staleTime: 5 * 60 * 1000,
  });
}
