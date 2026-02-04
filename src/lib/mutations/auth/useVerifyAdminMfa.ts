import { useMutation } from "@tanstack/react-query";
import { verifyAdminMfa } from "@/lib/api/auth";
import { useUserStore } from "@/store/useUserStore";
import { useQueryClient } from "@tanstack/react-query";

export function useVerifyAdminMfa() {
  const queryClient = useQueryClient();
  const setAuth = useUserStore((s) => s.setAuth);
  const clearUser = useUserStore((s) => s.clearUser);

  return useMutation({
    mutationFn: verifyAdminMfa,
    onSuccess: async (data) => {
      // Store in Zustand + localStorage
      setAuth({
        token: data.token,
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
      });

      // Set token in httpOnly cookie for middleware
      try {
        await fetch("/api/auth/set-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: data.token,
            userRole: data.user.role,
          }),
        });
      } catch (err) {
        console.error("Failed to set token cookie:", err);
      }

      // Invalidate useMe query so it refetches with new token
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: () => {
      clearUser();
    },
  });
}
