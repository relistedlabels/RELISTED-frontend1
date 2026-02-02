"use client";

import React, { useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Paragraph1 } from "@/common/ui/Text";
import BackHeader from "@/common/ui/BackHeader";
import { useCreateProduct } from "@/lib/queries/product/useCreateProduct";
import { useUpdateProduct } from "@/lib/queries/product/useUpdateProduct";
import { useProductDraftStore } from "@/store/useProductDraftStore";
import { toast } from "sonner";

interface UploadItemHeaderProps {
  title?: string;
  subtitle?: string;
  productName?: string;
}

const UploadItemHeader: React.FC<UploadItemHeaderProps> = ({
  title = "Add New Item",
  subtitle = "List a new fashion item for rent",
}) => {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const isEditing = pathname.includes("product-edit");
  const productId = params.id as string;

  const { data } = useProductDraftStore();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(productId);

  const mutation = isEditing ? updateProduct : createProduct;
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = () => {
    if (mutation.isPending) return;

    setErrorMessage("");

    mutation.mutate(data, {
      onSuccess: () => {
        // ✅ Show success toast
        if (isEditing) {
          toast.success("Product updated successfully!");
        } else {
          toast.success("Product created successfully!");
        }

        // ✅ Route to inventory after brief delay for toast visibility
        setTimeout(() => {
          router.push("/listers/inventory");
        }, 1000);
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to save product. Please try again.";
        setErrorMessage(message);

        // ✅ Also show error toast
        toast.error(message);
      },
    });
  };

  const isPending = mutation.isPending;

  return (
    <div className="mb-4 flex w-full flex-col gap-4 bg-transparent sm:flex-row sm:items-center sm:justify-between">
      <BackHeader
        title={isEditing ? "Edit Item" : title}
        subtitle={isEditing ? `Updating product` : subtitle}
      />

      <div className="flex flex-col items-end gap-2">
        {errorMessage && (
          <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
        )}
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className={`w-full rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-95 sm:w-fit ${
            isPending
              ? "cursor-not-allowed bg-gray-400"
              : "bg-[#33332D] hover:bg-black"
          }`}
        >
          <Paragraph1>
            {isPending
              ? isEditing
                ? "Updating…"
                : "Creating…"
              : isEditing
                ? "Save Changes"
                : "Post Item"}
          </Paragraph1>
        </button>
      </div>
    </div>
  );
};

export default UploadItemHeader;
