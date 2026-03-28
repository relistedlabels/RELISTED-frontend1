import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/http";

interface SubmitBvnPayload {
  bvn: string;
}

export function useSubmitBvn() {
  return useMutation({
    mutationFn: async (payload: SubmitBvnPayload) => {
      return apiFetch("/api/listers/verifications/bvn", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  });
}
