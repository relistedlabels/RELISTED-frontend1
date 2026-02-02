import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api/product";

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.getById(id),
    enabled: !!id,
  });
}


