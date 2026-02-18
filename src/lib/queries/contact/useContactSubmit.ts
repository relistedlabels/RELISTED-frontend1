import { useMutation } from "@tanstack/react-query";
import { publicApi } from "@/lib/api/public";

export const useContactSubmit = () =>
  useMutation({
    mutationFn: async (data: {
      firstName: string;
      lastName: string;
      email: string;
      message: string;
    }) => {
      const response = await publicApi.submitContact(data);
      return response;
    },
  });
