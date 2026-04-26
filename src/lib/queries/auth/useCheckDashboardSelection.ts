import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { checkDashboardSelection } from "@/lib/api/auth";

export function useCheckDashboardSelection(
  options?: Omit<
    UseQueryOptions<{
      isAdmin: boolean;
      user: { id: string; email: string; role: string; name: string };
    }>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["auth", "dashboard-selection"],
    queryFn: checkDashboardSelection,
    retry: false,
    ...options,
  });
}
