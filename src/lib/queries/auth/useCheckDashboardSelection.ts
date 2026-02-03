import { useQuery } from "@tanstack/react-query";
import { checkDashboardSelection } from "@/lib/api/auth";

export function useCheckDashboardSelection() {
  return useQuery({
    queryKey: ["auth", "dashboard-selection"],
    queryFn: checkDashboardSelection,
    retry: false,
    enabled: false, // Manual triggering
  });
}
