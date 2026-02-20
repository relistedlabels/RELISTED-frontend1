import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/http";
import {
  useProductDraftStore,
  ProductDraft,
} from "@/store/useProductDraftStore";

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const reset = useProductDraftStore((state) => state.reset);

  return useMutation({
    mutationFn: async (draft: ProductDraft) => {
      // ✅ Extract ONLY image IDs (as strings)
      const attachmentIds = draft.attachments
        .filter((att) => att.type === "image")
        .map((att) => att.id);

      // ✅ Validate before sending
      console.group("🔍 VALIDATION CHECK");
      console.log("Draft data:", draft);
      console.log("Attachment IDs:", attachmentIds);
      console.log("Attachment count:", attachmentIds.length);
      console.groupEnd();

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
        quantity: draft.quantity,
        color: draft.color,
        warning: draft.warning.trim(),
        careInstruction: draft.careInstruction.trim(),
        careSteps: draft.careSteps?.trim() ?? "",
        stylingTip: draft.stylingTip.trim(),
        attachments: attachmentIds,
        categoryId: draft.categoryId,
        tagIds: draft.tagIds,
        brandId: draft.brandId,
      };

      // ✅ Log exact payload being sent
      console.group("📤 PAYLOAD BEING SENT");
      console.log("Full payload:", JSON.stringify(payload, null, 2));
      console.table({
        name: payload.name,
        dailyPrice: payload.dailyPrice,
        quantity: payload.quantity,
        originalValue: payload.originalValue,
        attachmentCount: payload.attachments.length,
        categoryId: payload.categoryId,
        tagIds: payload.tagIds,
        brandId: payload.brandId,
        condition: payload.condition,
        composition: payload.composition,
        material: payload.material,
        measurement: payload.measurement,
      });
      console.groupEnd();

      try {
        const response = await apiFetch<{ message: string }>(
          "/api/listers/inventory",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );

        console.log("✅ Success response:", response);
        return response;
      } catch (error: any) {
        console.group("❌ ERROR RESPONSE");
        console.error("Status:", error?.response?.status);
        console.error("Data:", error?.response?.data);
        console.error("Headers:", error?.response?.headers);
        console.error("Full error:", error);
        console.groupEnd();
        throw error;
      }
    },
    onSuccess: (response) => {
      console.log("✅ Product created:", response.message);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      reset();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.errors ||
        error?.message ||
        "Failed to create product";

      console.error("❌ Mutation failed:", errorMessage);
    },
  });
};
