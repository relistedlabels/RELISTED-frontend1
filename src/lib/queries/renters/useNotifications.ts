import { useQuery, useMutation } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useNotificationPreferences = () =>
  useQuery({
    queryKey: ["renter-notification-preferences"],
    queryFn: rentersApi.getNotificationPreferences,
  });

export const useUpdateNotificationPreferences = () =>
  useMutation({
    mutationFn: rentersApi.updateNotificationPreferences,
  });
