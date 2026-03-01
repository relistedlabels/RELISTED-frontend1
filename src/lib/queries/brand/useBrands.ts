import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBrands, createBrand, Brand } from "@/lib/api/brands";
import { publicApi } from "@/lib/api/public";

export const useBrands = () => {
  return useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: getBrands,
    retry: false,
  });
};

export const useBrandById = (brandId: string) => {
  return useQuery({
    queryKey: ["brand", brandId],
    queryFn: async () => {
      const response = await publicApi.getBrandById(brandId);
      return response.data.brand;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!brandId,
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
