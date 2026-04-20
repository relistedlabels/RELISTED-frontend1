import { useMutation, useQueryClient } from "@tanstack/react-query";
import { withdrawFunds } from "@/lib/api/listers";

export function useWithdrawFunds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      amount: number;
      bankAccountId: string;
      notes?: string;
    }) => {
      console.log("[WITHDRAWAL MUTATION] Calling withdrawFunds API:", data);
      return withdrawFunds(data);
    },
    onSuccess: (response) => {
      console.log("[WITHDRAWAL MUTATION] API call successful:", response);
      // Invalidate wallet balance
      queryClient.invalidateQueries({
        queryKey: ["listers", "wallet", "balance"],
      });
      // Invalidate transactions
      queryClient.invalidateQueries({
        queryKey: ["listers", "wallet", "transactions"],
      });
    },
    onError: (error) => {
      console.error("[WITHDRAWAL MUTATION] API call failed:", error);
    },
  });
}
