import { useQuery } from "@tanstack/react-query";
import { getVerificationStatus } from "@/lib/api/listers";

export function useVerificationStatus() {
  return useQuery({
    queryKey: ["listers", "verifications", "status"],
    queryFn: () => getVerificationStatus(),
    staleTime: 5 * 60 * 1000,
  });
}
