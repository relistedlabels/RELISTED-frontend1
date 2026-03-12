import { useMutation, useQueryClient } from "@tanstack/react-query";
import { withdrawFunds } from "@/lib/api/listers";

export function useWithdrawFunds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      amount: number;
      bankAccountId: string;
      notes?: string;
    }) => withdrawFunds(data),
    onSuccess: () => {
      // Invalidate wallet balance
      queryClient.invalidateQueries({
        queryKey: ["listers", "wallet", "balance"],
      });
      // Invalidate transactions
      queryClient.invalidateQueries({
        queryKey: ["listers", "wallet", "transactions"],
      });
    },
  });
}
