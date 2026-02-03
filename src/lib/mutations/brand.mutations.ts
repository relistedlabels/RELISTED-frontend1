import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrand } from "@/lib/api/brands";

export const useCreateBrand = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => createBrand(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};
