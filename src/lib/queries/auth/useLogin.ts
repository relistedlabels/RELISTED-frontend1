// lib/queries/auth/useLogin.ts
import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/api/auth";
import { useUserStore } from "@/store/useUserStore";

export function useLogin() {
  const setAuth = useUserStore((s) => s.setAuth);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth({
        token: data.token,
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
      });
    },
  });
}
