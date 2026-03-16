import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api/auth";
import { useUserStore } from "@/store/useUserStore";

export function useMe(options?: { enabled?: boolean }) {
  const token = useUserStore((s) => s.token);
  // Only execute query if we have a real token and not explicitly disabled
  const shouldFetch = token !== null && options?.enabled !== false;

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    retry: false,
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
