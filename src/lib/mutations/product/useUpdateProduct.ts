import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/http";
import {
  useProductDraftStore,
  ProductDraft,
} from "@/store/useProductDraftStore";

export const useUpdateProduct = (productId: string) => {
  const queryClient = useQueryClient();
  const reset = useProductDraftStore((state) => state.reset);

  return useMutation({
    mutationFn: async (draft: ProductDraft) => {
      // ✅ Extract ONLY image IDs (as strings)
      const attachmentIds = draft.attachments
        .filter((att) => att.type === "image")
        .map((att) => att.id);

      const payload = {
        name: draft.name.trim(),
        subText: draft.subText.trim(),
        description: draft.description.trim(),
        condition: draft.condition,
        composition: draft.composition || "Cotton", // ✅ String default
        measurement: draft.measurement,
        originalValue: draft.originalValue,
        dailyPrice: draft.dailyRentalPrice, // ✅ Correct field name
        quantity: draft.quantity, // ✅ Include quantity
        color: draft.color, // ✅ String, not array
        warning: draft.warning.trim(),
        careInstruction: draft.careInstruction.trim(),
        careSteps: draft.careSteps?.trim() ?? "",
        stylingTip: draft.stylingTip.trim(),
        attachments: attachmentIds, // ✅ Array of ID strings
        categoryId: draft.categoryId,
        tagId: draft.tagId, // ✅ Separate from categoryId
        brandId: draft.brandId,
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
