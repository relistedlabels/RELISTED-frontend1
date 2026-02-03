import { useQuery } from "@tanstack/react-query";
import { getBrands, Brand } from "@/lib/api/brands";

export const useBrands = () => {
  return useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: getBrands,
    retry: false,
  });
};
