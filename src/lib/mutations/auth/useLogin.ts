import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/api/auth";
import { useUserStore } from "@/store/useUserStore";

export function useLogin() {
  const setAuth = useUserStore((s) => s.setAuth);
  const setMfaSession = useUserStore((s) => s.setMfaSession);

  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      // If MFA is required (admin user)
      if (data.requiresMfa && data.sessionToken) {
        setMfaSession({
          sessionToken: data.sessionToken,
          email: data.user?.email || "",
        });
      }
      // If MFA is not required (regular user)
      else if (data.token && data.user) {
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
      }
    },
  });
}
