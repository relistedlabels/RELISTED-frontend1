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
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["listers", "wallet", "bank-accounts"],
      });
      await queryClient.invalidateQueries({ queryKey: ["listers", "profile"] });
      await queryClient.refetchQueries({
        queryKey: ["listers", "wallet", "bank-accounts"],
      });
    },
  });
}
