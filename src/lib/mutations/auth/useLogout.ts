import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/http";
import { clearAuthenticatedClientSession } from "@/lib/auth/clearAuthenticatedClientSession";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import { useSessionStore } from "@/store/useSessionStore";
import { useUserStore } from "@/store/useUserStore";

export function useLogout() {
  const qc = useQueryClient();
  const clearUser = useUserStore((s) => s.clearUser);

  return useMutation({
    mutationFn: () => apiFetch("/auth/logout", { method: "POST" }),
    onMutate: () => {
      useSessionStore.getState().setSessionExpired(false);
      useAdminIdStore.getState().clearAdminId();
    },
    onSettled: async () => {
      await clearUser();
      useAdminIdStore.getState().clearAdminId();
      useSessionStore.getState().setSessionExpired(false);
      clearAuthenticatedClientSession(qc);
    },
  });
}
