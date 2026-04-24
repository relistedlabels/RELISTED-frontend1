import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/http";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import { useUserStore } from "@/store/useUserStore";

export function useLogout() {
  const qc = useQueryClient();
  const clearUser = useUserStore((s) => s.clearUser);

  return useMutation({
    mutationFn: () => apiFetch("/auth/logout", { method: "POST" }),
    onSettled: () => {
      clearUser();
      useAdminIdStore.getState().clearAdminId();
      qc.removeQueries({ queryKey: ["auth", "me"] });
    },
  });
}
