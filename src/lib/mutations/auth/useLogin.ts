import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/api/auth";
import { establishSession } from "@/lib/auth/establishSession";
import { useUserStore } from "@/store/useUserStore";

export function useLogin() {
  const setMfaSession = useUserStore((s) => s.setMfaSession);

  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      if (data.requiresMfa && data.sessionToken) {
        setMfaSession({
          sessionToken: data.sessionToken,
          email: data.user?.email || "",
        });
      } else if (data.token && data.user) {
        await establishSession({ token: data.token, user: data.user });
      }
    },
  });
}
