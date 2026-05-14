import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/http";
import { orderedImageAttachmentIds } from "@/lib/product/attachmentSlotOrder";
import {
  type ProductDraft,
  useProductDraftStore,
} from "@/store/useProductDraftStore";

export const useUpdateProduct = (productId: string) => {
  const queryClient = useQueryClient();
  const reset = useProductDraftStore((state) => state.reset);

  return useMutation({
    mutationFn: async (draft: ProductDraft) => {
      const attachmentIds = orderedImageAttachmentIds(draft.attachments);
      const tagIds = draft.tagIds;

      const payload = {
        name: draft.name.trim(),
        subText: draft.subText.trim(),
        description: draft.description.trim(),
        condition: draft.condition,
        composition: draft.composition || "Cotton",
        material: draft.material || "Cotton",
        measurement: draft.measurement,
        originalValue: draft.originalValue,
        dailyPrice: draft.dailyRentalPrice,
        collateralPrice: draft.collateralPrice,
        quantity: draft.quantity,
        color: draft.color,
        warning: draft.warning.trim(),
        careInstruction: draft.careInstruction.trim(),
        careSteps: draft.careSteps?.trim() ?? "",
        stylingTip: draft.stylingTip.trim(),
        attachments: attachmentIds,
        categoryId: draft.categoryId,
        tagids: tagIds,
        brandId: draft.brandId,
        listingType:
          draft.saleType === "resale"
            ? "RESALE"
            : draft.saleType === "rent"
              ? "RENTAL"
              : "RENT_OR_RESALE",
        resalePrice: draft.resalePrice,
        ...(typeof draft.closetId === "string"
          ? { closetId: draft.closetId === "" ? null : draft.closetId }
          : {}),
      };

      console.log("📤 Final payload being sent:", payload);

      return apiFetch<{ message: string }>(`/product/${productId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (response) => {
      console.log("✅ Product updated:", response.message);
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "listings", "detail", productId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "listings"] });
      queryClient.invalidateQueries({ queryKey: ["user-products"] });
      queryClient.invalidateQueries({ queryKey: ["closets", "mine"] });
      reset();
    },
    onError: (error: any) => {
      console.error("❌ Failed to update product:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
    },
  });
};
