import { categoryApi, type Category } from "@/lib/api/category";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.getCategories,
    retry: false,
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => categoryApi.createCategory(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
