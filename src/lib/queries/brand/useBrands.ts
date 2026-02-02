// lib/queries/brand/useBrands.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBrands, createBrand, Brand } from "@/lib/api/brands";

export const useBrands = () => {
  return useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: getBrands,
    retry: false,
  });
};

export const useCreateBrand = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => createBrand(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};
