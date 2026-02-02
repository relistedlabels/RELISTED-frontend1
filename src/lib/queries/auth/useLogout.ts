import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/http";
import { useUserStore } from "@/store/useUserStore";

export function useLogout() {
  const qc = useQueryClient();
  const clearUser = useUserStore((s) => s.clearUser);

  return useMutation({
    mutationFn: () => apiFetch("/auth/logout", { method: "POST" }),
    onSettled: () => {
      clearUser();
      qc.removeQueries({ queryKey: ["auth", "me"] });
    },
  });
}
