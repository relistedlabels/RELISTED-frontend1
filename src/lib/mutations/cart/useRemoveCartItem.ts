import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeCartItem } from "@/lib/api/cart";
import { rentersApi } from "@/lib/api/renters";

export type RemoveCartLineInput = {
  cartItemId?: string | null;
  rentalRequestId?: string | null;
};

function trimId(id: string | null | undefined): string | undefined {
  if (id == null || typeof id !== "string") return undefined;
  const t = id.trim();
  return t || undefined;
}

export function cartLineIdFromRentalItem(
  item: Record<string, unknown>,
): string | undefined {
  return trimId(
    (item.cartItemId ?? item.cart_item_id) as string | null | undefined,
  );
}

function isNotFoundCartDeleteError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /404|not found|Cannot DELETE/i.test(msg);
}

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cartItemId,
      rentalRequestId,
    }: RemoveCartLineInput) => {
      const cid = trimId(cartItemId ?? undefined);
      const rid = trimId(rentalRequestId ?? undefined);
      if (cid) {
        try {
          return await removeCartItem(cid);
        } catch (e) {
          if (rid && isNotFoundCartDeleteError(e)) {
            return rentersApi.removeRentalRequest(rid);
          }
          throw e;
        }
      }
      if (rid) return rentersApi.removeRentalRequest(rid);
      throw new Error("Missing cart or rental request id");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", "items"] });
      queryClient.invalidateQueries({ queryKey: ["renters", "rental-requests"] });
      queryClient.invalidateQueries({ queryKey: ["renters", "cart"] });
      queryClient.invalidateQueries({
        queryKey: ["renters", "cart", "summary"],
      });
    },
  });
};
