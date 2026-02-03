import { useMutation } from "@tanstack/react-query";
import { verifyAdminMfa } from "@/lib/api/auth";
import { useUserStore } from "@/store/useUserStore";

export function useVerifyAdminMfa() {
  const setAuth = useUserStore((s) => s.setAuth);
  const clearUser = useUserStore((s) => s.clearUser);

  return useMutation({
    mutationFn: verifyAdminMfa,
    onSuccess: (data) => {
      setAuth({
        token: data.token,
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
      });
    },
    onError: () => {
      clearUser();
    },
  });
}
