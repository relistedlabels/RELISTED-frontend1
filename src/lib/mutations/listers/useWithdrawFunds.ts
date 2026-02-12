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
      // Invalidate wallet stats
      queryClient.invalidateQueries({
        queryKey: ["listers", "wallet", "stats"],
      });
      // Invalidate transactions
      queryClient.invalidateQueries({
        queryKey: ["listers", "wallet", "transactions"],
      });
    },
  });
}
