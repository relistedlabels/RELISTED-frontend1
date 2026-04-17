"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import BackHeader from "@/common/ui/BackHeader";
import { Paragraph1 } from "@/common/ui/Text";
import { useCreateProduct, useUpdateProduct } from "@/lib/mutations";
import { useProfile } from "@/lib/queries/user/useProfile";
import { useProductDraftStore } from "@/store/useProductDraftStore";
import PendingVerificationModal from "./PendingVerificationModal";

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
  const reset = useProductDraftStore((state) => state.reset);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(productId);
  const { data: profile } = useProfile();

  const mutation = isEditing ? updateProduct : createProduct;
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Check if user is verified on mount
  useEffect(() => {
    if (profile?.bvn) {
      setIsVerified(true);
    }
  }, [profile]);

  const handleSubmit = () => {
    // Check if user is verified
    if (!isVerified) {
      setIsVerificationModalOpen(true);
      return;
    }

    if (mutation.isPending) return;

    setErrorMessage("");

    // Validation: Check for minimum 2 images
    const imageAttachments = data.attachments.filter(
      (att) => att.type === "image" || (!att.type && att.slotId !== "video"),
    );
    if (imageAttachments.length < 2) {
      setErrorMessage("Please upload at least 2 images of your item.");
      toast.error("Please upload at least 2 images of your item.");
      return;
    }

    // Validation: Check for price
    if (!data.dailyRentalPrice || data.dailyRentalPrice <= 0) {
      setErrorMessage("Please set a valid rental price for your item.");
      toast.error("Please set a valid rental price for your item.");
      return;
    }

    // Validation: Check for brand
    if (!data.brandId || data.brandId === "") {
      setErrorMessage("Please select a brand for your item.");
      toast.error("Please select a brand for your item.");
      return;
    }

    // Validation: Check for size
    if (!data.measurement || data.measurement === "") {
      setErrorMessage("Please select a size for your item.");
      toast.error("Please select a size for your item.");
      return;
    }

    mutation.mutate(data, {
      onSuccess: () => {
        reset();

        if (isEditing) {
          toast.success("Product updated successfully!");
        } else {
          toast.success("Product created successfully!");
        }

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
    <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 bg-transparent mb-4 w-full">
      <BackHeader
        title={isEditing ? "Edit Item" : title}
        subtitle={isEditing ? `Updating product` : subtitle}
      />

      <div className="flex flex-col items-end gap-2">
        {errorMessage && (
          <p className="font-medium text-red-600 text-xs">{errorMessage}</p>
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

      {/* Pending Verification Modal */}
      <PendingVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
      />
    </div>
  );
};

export default UploadItemHeader;
