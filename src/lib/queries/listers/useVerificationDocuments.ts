import { useQuery } from "@tanstack/react-query";
import { getVerificationDocuments } from "@/lib/api/listers";

export function useVerificationDocuments() {
  return useQuery({
    queryKey: ["listers", "verifications", "documents"],
    queryFn: () => getVerificationDocuments(),
    staleTime: 5 * 60 * 1000,
  });
}
