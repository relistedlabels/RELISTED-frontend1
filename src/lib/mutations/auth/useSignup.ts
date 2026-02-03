// lib/queries/auth/useSignup.ts
import { useMutation } from "@tanstack/react-query";
import { signup } from "@/lib/api/auth";

export function useSignup() {
  return useMutation({
    mutationFn: signup,
  });
}
