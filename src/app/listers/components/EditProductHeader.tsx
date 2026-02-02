"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Paragraph1 } from "@/common/ui/Text";
import BackHeader from "@/common/ui/BackHeader";
import { useUpdateProduct } from "@/lib/queries/product/useUpdateProduct";
import { useProductDraftStore } from "@/store/useProductDraftStore";
import { toast } from "sonner";

interface EditProductHeaderProps {
  productName?: string;
}

const EditProductHeader: React.FC<EditProductHeaderProps> = ({
  productName = "Edit Item",
}) => {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { data } = useProductDraftStore();
  const updateProduct = useUpdateProduct(productId);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = () => {
    if (updateProduct.isPending) return;

    setErrorMessage("");

    updateProduct.mutate(data, {
      onSuccess: () => {
        // ✅ Show success toast
        toast.success("Product updated successfully! 🎉", {
          description: "Your changes have been saved.",
          duration: 3000,
        });

        // ✅ Route back to inventory after brief delay
        setTimeout(() => {
          router.push("/listers/inventory");
        }, 1500);
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update product. Please try again.";

        setErrorMessage(message);
        toast.error("Update failed", {
          description: message,
          duration: 4000,
        });
      },
    });
  };

  const isUpdating = updateProduct.isPending;

  return (
    <div className="mb-4 flex w-full flex-col gap-4 bg-transparent sm:flex-row sm:items-center sm:justify-between">
      <BackHeader title="Edit Item" subtitle={`Updating: ${productName}`} />

      <div className="flex flex-col items-end gap-2">
        {errorMessage && (
          <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
        )}
        <button
          onClick={handleSubmit}
          disabled={isUpdating}
          className={`w-full rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-95 sm:w-fit ${
            isUpdating
              ? "cursor-not-allowed bg-gray-400"
              : "bg-[#33332D] hover:bg-black"
          }`}
        >
          <Paragraph1>{isUpdating ? "Updating…" : "Save Changes"}</Paragraph1>
        </button>
      </div>
    </div>
  );
};

export default EditProductHeader;
