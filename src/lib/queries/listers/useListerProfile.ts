import { useQuery } from "@tanstack/react-query";
import { getListerProfile } from "@/lib/api/listers";
import { useUserStore } from "@/store/useUserStore";

export function useListerProfile(enabled: boolean = true) {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["listers", "profile"],
    queryFn: () => getListerProfile(),
    staleTime: 5 * 60 * 1000,
    enabled: enabled && token !== null,
  });
}
