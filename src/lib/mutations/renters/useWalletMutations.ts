import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useDepositFunds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      amount: number;
      paymentMethod: string;
      bankAccountId?: string;
    }) => rentersApi.depositFunds(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renters", "wallet"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "wallet", "transactions"],
      });
    },
  });
};

export const useWithdrawFunds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { amount: number; bankAccountId: string }) =>
      rentersApi.withdrawFunds(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renters", "wallet"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "wallet", "transactions"],
      });
    },
  });
};

export const useAddBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      bankCode: string;
      accountNumber: string;
      accountName: string;
      accountType: string;
    }) => rentersApi.addBankAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["renters", "bank-accounts"],
      });
    },
  });
};
