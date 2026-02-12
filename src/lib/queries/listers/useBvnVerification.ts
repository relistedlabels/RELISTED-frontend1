import { useQuery } from "@tanstack/react-query";
import { getBvnVerification } from "@/lib/api/listers";

export function useBvnVerification() {
  return useQuery({
    queryKey: ["listers", "verifications", "bvn"],
    queryFn: () => getBvnVerification(),
    staleTime: 5 * 60 * 1000,
  });
}
