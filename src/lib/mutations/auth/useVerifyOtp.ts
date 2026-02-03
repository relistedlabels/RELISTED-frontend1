import { useMutation } from "@tanstack/react-query";
import { verifyOtp } from "@/lib/api/auth";

export function useVerifyOtp() {
  return useMutation({
    mutationFn: verifyOtp,
  });
}
