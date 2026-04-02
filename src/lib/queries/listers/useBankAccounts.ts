import { useQuery } from "@tanstack/react-query";
import { getBankAccounts } from "@/lib/api/listers";
import { parseWalletBankAccountsResponse } from "@/lib/renters/parseWalletBankAccountsResponse";

/** `verified`: omit to fetch all accounts (e.g. withdraw UI). `true`/`false` adds query param. */
export function useBankAccounts(verified?: boolean) {
  return useQuery({
    queryKey: ["listers", "wallet", "bank-accounts", verified ?? "all"],
    queryFn: async () => {
      const res = await getBankAccounts(verified);
      return parseWalletBankAccountsResponse(res);
    },
    staleTime: 60 * 1000,
    retry: 1,
  });
}
