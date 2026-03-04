"use client";

import React, { useState, useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Paragraph1 } from "@/common/ui/Text";
import BackHeader from "@/common/ui/BackHeader";
import { useCreateProduct, useUpdateProduct } from "@/lib/mutations";
import { useProductDraftStore } from "@/store/useProductDraftStore";
import { toast } from "sonner";
import { useProfile } from "@/lib/queries/user/useProfile";
import { useVerificationStatus } from "@/lib/queries/listers/useVerificationStatus";
import VerificationModalListers from "./VerificationModalListers";

interface UploadItemHeaderProps {
  title?: string;
  subtitle?: string;
  productName?: string;
}

const VERIFICATION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

const formatCountdown = (ms: number): string => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

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
  const { data: profile } = useProfile();
  const verificationStatusQuery = useVerificationStatus();

  const mutation = isEditing ? updateProduct : createProduct;
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationSubmittedAt, setVerificationSubmittedAt] = useState<
    number | null
  >(null);
  const [countdown, setCountdown] = useState(0);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Check if user is verified on mount
  useEffect(() => {
    if (profile?.bvn) {
      setIsVerified(true);
    }
  }, [profile]);

  // Countdown timer
  useEffect(() => {
    if (!verificationSubmittedAt) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - verificationSubmittedAt;
      const remaining = VERIFICATION_TIMEOUT - elapsed;

      if (remaining <= 0) {
        setCountdown(0);
        clearInterval(interval);
      } else {
        setCountdown(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [verificationSubmittedAt]);

  const handleVerificationComplete = () => {
    // Record when verification was submitted
    setVerificationSubmittedAt(Date.now());
    setIsVerificationModalOpen(false);
  };

  const checkVerificationStatus = async () => {
    if (countdown > 0) {
      alert(
        `Please wait ${formatCountdown(countdown)} before checking verification status.`,
      );
      return;
    }

    setIsCheckingStatus(true);
    try {
      await verificationStatusQuery.refetch();
      // Check if user has BVN verified
      if (profile?.bvn) {
        setIsVerified(true);
        setVerificationSubmittedAt(null);
        setCountdown(0);
      } else {
        alert(
          "Verification is still pending. Please try again in a few moments.",
        );
      }
    } catch (err) {
      console.error("Failed to check verification status:", err);
      alert("Failed to check verification status. Please try again.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSubmit = () => {
    // If verification is pending, check status first
    if (verificationSubmittedAt && countdown > 0) {
      alert(
        `Please wait ${formatCountdown(countdown)} before checking verification status.`,
      );
      return;
    }

    // If verification was submitted but countdown expired, check status
    if (verificationSubmittedAt && countdown === 0) {
      checkVerificationStatus();
      return;
    }

    // Check if user is verified
    if (!isVerified) {
      setIsVerificationModalOpen(true);
      return;
    }

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

        {/* Verification Status Messages */}
        {verificationSubmittedAt && countdown > 0 && (
          <div className="text-xs bg-blue-50 text-blue-900 border border-blue-200 px-3 py-2 rounded">
            ⏱️ Verification in progress. Please wait{" "}
            {formatCountdown(countdown)} to check status.
          </div>
        )}

        {verificationSubmittedAt && countdown === 0 && (
          <div className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-2 rounded">
            ✓ Verification timer complete. Click below to check status.
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isPending || isCheckingStatus}
          className={`w-full rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-95 sm:w-fit ${
            isPending || isCheckingStatus
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

      {/* Verification Modal */}
      <VerificationModalListers
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onVerified={handleVerificationComplete}
        currentBvn={profile?.bvn}
      />
    </div>
  );
};

export default UploadItemHeader;
