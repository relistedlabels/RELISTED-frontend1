import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/api/auth";
import { useUserStore } from "@/store/useUserStore";

export function useLogin() {
  const setAuth = useUserStore((s) => s.setAuth);
  const setMfaSession = useUserStore((s) => s.setMfaSession);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // If MFA is required (admin user)
      if (data.requiresMfa && data.sessionToken) {
        setMfaSession({
          sessionToken: data.sessionToken,
          email: data.email || "",
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
      }
    },
  });
}
