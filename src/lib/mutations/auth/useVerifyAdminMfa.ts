import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyAdminMfa } from "@/lib/api/auth";
import { useSessionStore } from "@/store/useSessionStore";
import { useUserStore } from "@/store/useUserStore";

export function useVerifyAdminMfa() {
  const queryClient = useQueryClient();
  const setAuth = useUserStore((s) => s.setAuth);
  const clearUser = useUserStore((s) => s.clearUser);
  const setSessionExpired = useSessionStore((s) => s.setSessionExpired);

  return useMutation({
    mutationFn: verifyAdminMfa,
    onSuccess: async (data) => {
      // Clear any session expired flag since we just authenticated
      setSessionExpired(false);

      // Set httpOnly cookie before Zustand so any immediate navigation
      // (e.g. verify-mfa page effect → dashboard) does not hit middleware
      // without a token.
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

      setAuth({
        token: data.token,
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
      });

      // Invalidate useMe query so it refetches with new token
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: () => {
      clearUser();
    },
  });
}
