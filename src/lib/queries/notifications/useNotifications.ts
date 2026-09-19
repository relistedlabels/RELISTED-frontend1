import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  NOTIFICATION_DEFAULT_DAYS,
  NOTIFICATION_DEFAULT_LIMIT,
} from "@/lib/api/notifications";
import { useUserStore } from "@/store/useUserStore";

export const notificationsQueryKey = [
  "notifications",
  "list",
  NOTIFICATION_DEFAULT_LIMIT,
  NOTIFICATION_DEFAULT_DAYS,
] as const;

export const useNotifications = () => {
  const token = useUserStore((s) => s.token);

  return useInfiniteQuery({
    queryKey: notificationsQueryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getNotifications({
        page: pageParam,
        limit: NOTIFICATION_DEFAULT_LIMIT,
        days: NOTIFICATION_DEFAULT_DAYS,
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: token !== null,
    staleTime: 30 * 1000,
    retry: 1,
  });
};

export const useNotificationsQueryClient = () => {
  return useQueryClient();
};
