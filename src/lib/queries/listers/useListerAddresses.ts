import { useQuery } from "@tanstack/react-query";
import { getListerAddresses } from "@/lib/api/listers";

export function useListerAddresses() {
  return useQuery({
    queryKey: ["listers", "profile", "addresses"],
    queryFn: () => getListerAddresses(),
    staleTime: 5 * 60 * 1000,
  });
}
