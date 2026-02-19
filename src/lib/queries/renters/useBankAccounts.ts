import { useQuery } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export const useBankAccounts = () =>
  useQuery({
    queryKey: ["renters", "bank-accounts"],
    queryFn: async () => {
      const response = await rentersApi.getBankAccounts();
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
