import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/http";

export interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

export const useAddresses = () => {
  return useQuery({
    queryKey: ["renters", "addresses"],
    queryFn: async () => {
      const res = await apiFetch<{
        success: boolean;
        data: { addresses: Address[] };
      }>("/api/renters/profile/addresses", { method: "GET" });
      return res.data.addresses;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
