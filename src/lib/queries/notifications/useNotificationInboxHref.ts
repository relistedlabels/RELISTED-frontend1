import { useMe } from "@/lib/queries/auth/useMe";
import { useAdminIdStore } from "@/store/useAdminIdStore";

export const useNotificationInboxHref = (): string | null => {
  const { data: user } = useMe();
  const adminId = useAdminIdStore((state) => state.adminId);

  if (!user) return null;

  const role = user.role?.toUpperCase();
  if (role === "ADMIN") {
    return adminId ? `/admin/${adminId}/notifications` : null;
  }
  if (role === "LISTER") {
    return "/listers/notifications";
  }
  return "/renters/notifications";
};
