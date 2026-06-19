import { useQuery, useMutation } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";
import { useUserStore } from "@/store/useUserStore";

export const useNotificationPreferences = () => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["renter-notification-preferences"],
    queryFn: rentersApi.getNotificationPreferences,
    enabled: token !== null,
  });
};

export const useUpdateNotificationPreferences = () =>
  useMutation({
    mutationFn: rentersApi.updateNotificationPreferences,
  });
