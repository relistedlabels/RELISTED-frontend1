import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBankAccount } from "@/lib/api/listers";

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      id: string;
      bankCode: string;
      accountNumber: string;
      accountName: string;
      accountType?: "savings" | "current";
    }) =>
      updateBankAccount(data.id, {
        bankCode: data.bankCode,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        accountType: data.accountType,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["listers", "wallet", "bank-accounts"],
      });
      await queryClient.refetchQueries({
        queryKey: ["listers", "wallet", "bank-accounts"],
      });
    },
  });
}
