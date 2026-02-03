// import { categoryApi } from "@/lib/api/category";
// import { useQuery } from "@tanstack/react-query";

// export function useCategories() {
//   return useQuery({
//     queryKey: ["category"],
//     queryFn: categoryApi,
//     retry: false,
//   });
// }

import { categoryApi } from "@/lib/api/category";
import { useQuery } from "@tanstack/react-query";

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.getCategories,
    retry: false,
  });
