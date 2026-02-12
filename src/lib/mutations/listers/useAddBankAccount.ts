import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBankAccount } from "@/lib/api/listers";

export function useAddBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      bankCode: string;
      accountNumber: string;
      accountName: string;
      accountType?: "savings" | "current";
    }) => addBankAccount(data),
    onSuccess: () => {
      // Invalidate bank accounts list
      queryClient.invalidateQueries({
        queryKey: ["listers", "wallet", "bank-accounts"],
      });
    },
  });
}
