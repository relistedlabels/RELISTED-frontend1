import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api/admin/";

export const useAdminProfile = () =>
  useQuery({
    queryKey: ["admin", "settings", "profile"],
    queryFn: () => settingsApi.getProfile(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const usePlatformControls = () =>
  useQuery({
    queryKey: ["admin", "settings", "platform-controls"],
    queryFn: () => settingsApi.getPlatformControls(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useRoles = () =>
  useQuery({
    queryKey: ["admin", "settings", "roles"],
    queryFn: () => settingsApi.getRoles(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useAdmins = (page: number = 1, limit: number = 20) =>
  useQuery({
    queryKey: ["admin", "settings", "admins", page, limit],
    queryFn: () => settingsApi.getAdmins(page, limit),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useAuditLogs = (
  page: number = 1,
  limit: number = 20,
  adminId?: string,
  actionType?: string,
) =>
  useQuery({
    queryKey: [
      "admin",
      "settings",
      "audit-logs",
      page,
      limit,
      adminId,
      actionType,
    ],
    queryFn: () => settingsApi.getAuditLogs(page, limit, adminId, actionType),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useDevices = () =>
  useQuery({
    queryKey: ["admin", "settings", "devices"],
    queryFn: () => settingsApi.getDevices(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
