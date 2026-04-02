import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";
import { parseWalletBankAccountsResponse } from "@/lib/renters/parseWalletBankAccountsResponse";

export const useBankAccounts = () =>
  useQuery({
    queryKey: ["renters", "bank-accounts"],
    queryFn: async () => {
      const response = await rentersApi.getBankAccounts();
      return parseWalletBankAccountsResponse(response);
    },
    staleTime: 60 * 1000,
    retry: 1,
  });
