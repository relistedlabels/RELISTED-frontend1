import { useMutation } from "@tanstack/react-query";
import { consumeMagicLink, requestMagicLink } from "@/lib/api/auth";
import { establishSession } from "@/lib/auth/establishSession";

export function useRequestMagicLink() {
  return useMutation({
    mutationFn: (data: { email: string; redirect?: string }) =>
      requestMagicLink(data),
  });
}

export function useConsumeMagicLink() {
  return useMutation({
    mutationFn: (code: string) => consumeMagicLink(code),
    onSuccess: async (data) => {
      if (data.token && data.user) {
        await establishSession({ token: data.token, user: data.user });
      }
    },
  });
}
