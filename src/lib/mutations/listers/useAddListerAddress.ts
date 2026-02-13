import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addListerAddress, type AddAddressPayload } from "@/lib/api/listers";

export function useAddListerAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddAddressPayload) => addListerAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listers", "profile", "addresses"],
      });
      queryClient.invalidateQueries({
        queryKey: ["listers", "profile"],
      });
    },
  });
}
