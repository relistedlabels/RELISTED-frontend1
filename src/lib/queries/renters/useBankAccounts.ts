import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";
import { parseWalletBankAccountsResponse } from "@/lib/renters/parseWalletBankAccountsResponse";
import { useUserStore } from "@/store/useUserStore";

export const useBankAccounts = () => {
  const token = useUserStore((s) => s.token);

  return useQuery({
    queryKey: ["renters", "bank-accounts"],
    queryFn: async () => {
      const response = await rentersApi.getBankAccounts();
      return parseWalletBankAccountsResponse(response);
    },
    staleTime: 60 * 1000,
    retry: 1,
    enabled: token !== null,
  });
};
