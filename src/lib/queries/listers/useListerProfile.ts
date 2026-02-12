import { useQuery } from "@tanstack/react-query";
import { getListerProfile } from "@/lib/api/listers";

export function useListerProfile() {
  return useQuery({
    queryKey: ["listers", "profile"],
    queryFn: () => getListerProfile(),
    staleTime: 5 * 60 * 1000,
  });
}
