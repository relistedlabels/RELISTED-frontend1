import { useQuery } from "@tanstack/react-query";
import { getListerProfile } from "@/lib/api/listers";

export function useListerProfile(enabled: boolean = true) {
  return useQuery({
    queryKey: ["listers", "profile"],
    queryFn: () => getListerProfile(),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}
