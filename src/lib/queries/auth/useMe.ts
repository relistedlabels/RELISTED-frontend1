import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api/auth";
import { useUserStoreHydrated } from "@/hooks/useUserStoreHydrated";
import { useUserStore } from "@/store/useUserStore";

export function useMe(options?: { enabled?: boolean }) {
  const hydrated = useUserStoreHydrated();
  const token = useUserStore((s) => s.token);
  const shouldFetch =
    hydrated && token !== null && options?.enabled !== false;

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    retry: false,
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
  });

  const isAuthLoading =
    !hydrated || (token !== null && query.isLoading && !query.isError);

  return {
    ...query,
    isLoading: isAuthLoading,
  };
}
