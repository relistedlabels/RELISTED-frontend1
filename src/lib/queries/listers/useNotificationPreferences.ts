import { useQuery } from "@tanstack/react-query";
import { getNotificationPreferences } from "@/lib/api/listers";

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["listers", "notifications", "preferences"],
    queryFn: () => getNotificationPreferences(),
    staleTime: 5 * 60 * 1000,
  });
}
