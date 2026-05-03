"use client";

import { useMutation } from "@tanstack/react-query";
import { rentersApi } from "@/lib/api/renters";

export function useSubscribeProductNotifyWhenAvailable() {
  return useMutation({
    mutationFn: (productId: string) =>
      rentersApi.subscribeProductNotifyWhenAvailable(productId),
  });
}
