import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  rentersApi,
  type RenterProfileBankAccountInfo,
} from "@/lib/api/renters";

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
      bankName: string;
      bankCode: string;
      accountNumber: string;
      accountName: string;
    }) => {
      const payload: { bankAccountInfo: RenterProfileBankAccountInfo } = {
        bankAccountInfo: {
          bankName: data.bankName,
          bankCode: data.bankCode,
          accountNumber: data.accountNumber.trim(),
          accountName: data.accountName.trim(),
        },
      };
      return rentersApi.updateProfile(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["renters", "profile"] });
      await queryClient.invalidateQueries({
        queryKey: ["renters", "bank-accounts"],
      });
      await queryClient.invalidateQueries({ queryKey: ["renters", "wallet"] });
      await queryClient.refetchQueries({ queryKey: ["renters", "bank-accounts"] });
    },
  });
};
