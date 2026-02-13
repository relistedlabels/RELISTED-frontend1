import { useQuery } from "@tanstack/react-query";
import { getDisputeMessages } from "@/lib/api/listers";

export function useDisputeMessages(
  disputeId: string | undefined,
  page: number = 1,
  limit: number = 50,
) {
  return useQuery({
    queryKey: ["listers", "disputes", "messages", disputeId, page, limit],
    queryFn: () => {
      if (!disputeId) throw new Error("disputeId is required");
      return getDisputeMessages(disputeId, page, limit);
    },
    enabled: !!disputeId,
    staleTime: 2 * 60 * 1000,
  });
}
