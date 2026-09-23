import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { checkDashboardSelection } from "@/lib/api/auth";
import { useUserStoreHydrated } from "@/hooks/useUserStoreHydrated";
import { useUserStore } from "@/store/useUserStore";

export function useCheckDashboardSelection(
  options?: Omit<
    UseQueryOptions<{
      isAdmin: boolean;
      user: { id: string; email: string; role: string; name: string };
    }>,
    "queryKey" | "queryFn"
  >,
) {
  const hydrated = useUserStoreHydrated();
  const token = useUserStore((s) => s.token);
  const { enabled: enabledOption = true, ...rest } = options ?? {};
  const enabled = hydrated && token !== null && enabledOption;

  const query = useQuery({
    queryKey: ["auth", "dashboard-selection"],
    queryFn: checkDashboardSelection,
    retry: false,
    ...rest,
    enabled,
  });

  return {
    ...query,
    data: enabled ? query.data : undefined,
  };
}
