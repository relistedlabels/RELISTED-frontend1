import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/api/auth";
import { useUserStore } from "@/store/useUserStore";
import { useSessionStore } from "@/store/useSessionStore";

export function useLogin() {
  const setAuth = useUserStore((s) => s.setAuth);
  const setMfaSession = useUserStore((s) => s.setMfaSession);
  const setSessionExpired = useSessionStore((s) => s.setSessionExpired);

  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      // Clear any session expired flag since we just authenticated
      setSessionExpired(false);

      // If MFA is required (admin user)
      if (data.requiresMfa && data.sessionToken) {
        setMfaSession({
          sessionToken: data.sessionToken,
          email: data.user?.email || "",
        });
      }
      // If MFA is not required (regular user)
      else if (data.token && data.user) {
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

        setAuth({
          token: data.token,
          userId: data.user.id,
          email: data.user.email,
          role: data.user.role,
          name: data.user.name,
        });
      }
    },
  });
}
