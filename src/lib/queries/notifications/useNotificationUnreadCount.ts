import { useQuery } from "@tanstack/react-query";
import {
  getNotificationUnreadCount,
  NOTIFICATION_DEFAULT_DAYS,
} from "@/lib/api/notifications";
import { useUserStore } from "@/store/useUserStore";

export const useNotificationUnreadCount = () => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["notifications", "unread-count", NOTIFICATION_DEFAULT_DAYS],
    queryFn: async () => {
      const response = await getNotificationUnreadCount(
        NOTIFICATION_DEFAULT_DAYS,
      );
      return response.data.unreadCount;
    },
    enabled: token !== null,
    refetchInterval: token !== null ? 30 * 1000 : false,
    refetchIntervalInBackground: false,
    staleTime: 30 * 1000,
    retry: 1,
  });
};
