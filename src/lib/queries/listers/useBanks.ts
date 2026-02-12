import { useQuery } from "@tanstack/react-query";
import { getBanks } from "@/lib/api/listers";

export function useBanks(country: string = "NG") {
  return useQuery({
    queryKey: ["banks", country],
    queryFn: () => getBanks(country),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
