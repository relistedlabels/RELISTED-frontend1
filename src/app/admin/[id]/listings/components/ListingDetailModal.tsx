"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Power,
  Edit,
  ShoppingBag,
  Calendar,
  Activity,
  Package,
  Loader,
  Clock,
} from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { Product, ProductDetail } from "@/lib/api/admin/listings";
import AvailabilityTab from "./AvailabilityTab";
import RentalHistoryTab from "./RentalHistoryTab";
import ActivityTab from "./ActivityTab";
import { useListingDetail } from "@/lib/queries/admin/useListings";
import { ItemImageUploader } from "@/app/listers/components/ItemImageUploader";
import { BasicInformationForm } from "@/app/listers/components/BasicInformationForm";
import { TagSelector } from "@/app/listers/components/TagSelector";
import { ItemDescription } from "@/app/listers/components/ItemDescription";
import { useProductDraftStore } from "@/store/useProductDraftStore";
import { useUpdateProduct } from "@/lib/mutations/product/useUpdateProduct";
import { toast } from "sonner";
import { orderedProductImageUrls } from "@/lib/product/sortProductAttachmentUploads";

import DeleteProductButton from "./DeleteProductButton";
import { CategorySelector } from "@/app/listers/components/CategorySelector";
import ItemTypeBadge from "./ItemTypeBadge";
import { listingPriceDisplay } from "@/lib/product/listingPriceDisplay";

interface ListingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | ProductDetail;
  onApprove?: (productId: string) => void;
  onReject?: (productId: string, comment: string) => void;
  onSendToPending?: (productId: string) => void;
  onDisable?: (productId: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  isSendingToPending?: boolean;
  isDisabling?: boolean;
}

const SEND_TO_PENDING_STATUSES = new Set([
  "APPROVED",
  "AVAILABLE",
  "UNAVAILABLE",
  "ACTIVE",
]);

function canSendToPendingReview(status?: string): boolean {
  return SEND_TO_PENDING_STATUSES.has(status?.toUpperCase() ?? "");
}

const DEFAULT_PRODUCT: Product = {
  id: "1",
  name: "Hermès Birkin 30",
  subText: "Iconic luxury handbag",
  image:
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop",
  category: "Bags",
  condition: "New",
  originalValue: 12500000,
  dailyPrice: 85000,
  quantity: 1,
  status: "pending",
  dateAdded: new Date().toISOString(),
  listerName: "John Doe",
  productVerified: true,
};

export default function ListingDetailModal({
  isOpen,
  onClose,
  product = DEFAULT_PRODUCT,
  onApprove,
  onReject,
  onSendToPending,
  onDisable,
  isApproving = false,
  isRejecting = false,
  isSendingToPending = false,
  isDisabling = false,
}: ListingDetailModalProps) {
  const [activeTab, setActiveTab] = React.useState<
    "details" | "edit" | "rental-history" | "availability" | "activity"
  >("details");
  const [showApproveModal, setShowApproveModal] = React.useState(false);
  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [showSendToPendingModal, setShowSendToPendingModal] =
    React.useState(false);
  const [showDisableModal, setShowDisableModal] = React.useState(false);
  const [rejectionComment, setRejectionComment] = React.useState("");
  const [showImageViewer, setShowImageViewer] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  // Fetch full product detail when modal is open and we have a product ID
  const { data: productDetail, isLoading } = useListingDetail(
    isOpen && product?.id ? product.id : "",
  );

  // Product draft store
  const draftData = useProductDraftStore((state) => state.data);
  const populateFromProduct = useProductDraftStore(
    (state) => state.populateFromProduct,
  );
  const reset = useProductDraftStore((state) => state.reset);

  // Update product mutation
  const updateProduct = useUpdateProduct(product?.id || "");

  // Populate draft store when product detail loads
  React.useEffect(() => {
    if (productDetail?.data && activeTab === "edit") {
      populateFromProduct(
        productDetail.data as unknown as Parameters<
          typeof populateFromProduct
        >[0],
      );
    }
  }, [productDetail?.data, activeTab, populateFromProduct]);

  // Clean up draft store when tab changes away from edit
  React.useEffect(() => {
    if (activeTab !== "edit") {
      reset();
    }
  }, [activeTab, reset]);

  // Use full product detail if available, fall back to basic product prop
  const displayProduct = productDetail?.data || product;
  const priceInfo = listingPriceDisplay(
    displayProduct as typeof displayProduct & {
      listingType?: string;
      resalePrice?: number;
    },
  );
  const subCategoryNames: string[] = React.useMemo(() => {
    const source = displayProduct as any;
    const tags = Array.isArray(source?.tags) ? source.tags : [];
    const namesFromTags = tags
      .map((tag: any) => tag?.name || tag?.label || tag?.value)
      .filter(
        (name: any): name is string => typeof name === "string" && !!name,
      );

    if (namesFromTags.length > 0) return namesFromTags;

    const ids =
      source?.tagids ||
      source?.tagIds ||
      (source?.tagId ? [source.tagId] : []) ||
      [];

    return Array.isArray(ids)
      ? ids.filter((id: any): id is string => typeof id === "string" && !!id)
      : [];
  }, [displayProduct]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      case "active":
      case "approved":
        return "bg-green-50 text-green-700";
      case "rejected":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const getDisplayStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Pending";
      case "active":
      case "approved":
        return "Active";
      case "rejected":
        return "Rejected";
      default:
        return status || "Unknown";
    }
  };

  // Prefer attachment URLs in display order; empty array falls back to legacy image.
  const fromUploads = orderedProductImageUrls({
    attachments: (displayProduct as any).attachments,
  });
  const imagesToDisplay: string[] =
    fromUploads.length > 0
      ? fromUploads
      : [displayProduct.image].filter(
          (u): u is string => typeof u === "string" && !!u,
        );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="z-40 fixed inset-0 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="top-0 right-0 bottom-0 z-50 fixed bg-white shadow-lg w-full md:w-3/4 overflow-y-auto"
          >
            {/* Header */}
            <div className="top-0 z-50 sticky bg-white p-6 border-gray-200 border-b">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-1 items-start gap-4">
                  {isLoading ? (
                    <div className="flex justify-center items-center bg-gray-200 rounded w-16 h-16">
                      <Loader
                        size={24}
                        className="text-gray-400 animate-spin"
                      />
                    </div>
                  ) : (
                    <img
                      src={imagesToDisplay[0]}
                      alt={displayProduct.name}
                      className="rounded w-16 h-16 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <Paragraph1 className="mb-1 text-gray-500 text-xs">
                      {(displayProduct as any).brand?.name || "Unknown Brand"}
                    </Paragraph1>
                    <div className="flex items-center gap-2">
                      <Paragraph3 className="font-bold text-gray-900 text-lg">
                        {displayProduct.name}
                      </Paragraph3>
                      <ItemTypeBadge listingType={priceInfo.listingType} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      displayProduct.status,
                    )}`}
                  >
                    {getDisplayStatus(displayProduct.status)}
                  </span>
                  <button
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-600 transition"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-fit">
                {/* Approve Button - Only show for Pending */}
                {displayProduct.status?.toUpperCase() === "PENDING" && (
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="flex flex-1 justify-center items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 px-3 py-2 rounded-lg font-medium text-white text-sm transition disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    <Check size={18} />
                    Approve
                  </button>
                )}

                {/* Reject Button - Only show for Pending */}
                {displayProduct.status?.toUpperCase() === "PENDING" && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex flex-1 justify-center items-center gap-2 hover:bg-gray-50 disabled:opacity-50 px-3 py-2 border border-gray-300 rounded-lg font-medium text-gray-600 text-sm transition disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    <AlertCircle size={18} />
                    Reject
                  </button>
                )}

                {canSendToPendingReview(displayProduct.status) && (
                  <button
                    onClick={() => setShowSendToPendingModal(true)}
                    className="inline-flex flex justify-center items-center gap-2 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 px-3 py-2 border border-amber-300 rounded-lg font-medium text-amber-800 text-sm whitespace-nowrap transition disabled:cursor-not-allowed"
                    disabled={isLoading || isSendingToPending}
                  >
                    <Clock size={18} />
                    Revert to Pending
                  </button>
                )}

                {/* Disable Button - Only show for Active/Approved */}
                {/* {(displayProduct.status?.toUpperCase() === "ACTIVE" ||
                  displayProduct.status?.toUpperCase() === "APPROVED") && (
                  <button
                    onClick={() => setShowDisableModal(true)}
                    className="flex flex-1 justify-center items-center gap-2 hover:bg-gray-50 disabled:opacity-50 px-3 py-2 border border-gray-300 rounded-lg font-medium text-gray-600 text-sm transition disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    <Power size={18} />
                    Disable
                  </button>
                )} */}

                <DeleteProductButton
                  productId={displayProduct.id}
                  productName={displayProduct.name}
                  onDeleteSuccess={onClose}
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white px-6 border-gray-200 border-b">
              <div className="flex gap-8">
                {[
                  { id: "details", label: "Product Details", icon: Package },
                  { id: "edit", label: "Edit Product", icon: Edit },
                  {
                    id: "rental-history",
                    label: "Rental History",
                    icon: ShoppingBag,
                  },
                  { id: "availability", label: "Availability", icon: Calendar },
                  { id: "activity", label: "Activity", icon: Activity },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-0 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "text-gray-900 border-black"
                        : "text-gray-500 border-transparent hover:text-gray-700"
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Product Details Section */}
                  <div>
                    <Paragraph3 className="mb-4 font-bold text-gray-900 text-base">
                      Product Details
                    </Paragraph3>

                    <div className="gap-4 grid grid-cols-3 mb-6">
                      {(displayProduct as any).brand && (
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <Paragraph1 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                            Brand
                          </Paragraph1>
                          <Paragraph1 className="font-medium text-gray-900 text-sm">
                            {(displayProduct as any).brand?.name || "Unknown"}
                          </Paragraph1>
                        </div>
                      )}
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <Paragraph1 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                          Category
                        </Paragraph1>
                        <Paragraph1 className="font-medium text-gray-900 text-sm">
                          {typeof displayProduct.category === "string"
                            ? displayProduct.category
                            : displayProduct.category?.name || "Uncategorized"}
                        </Paragraph1>
                      </div>
                      {(displayProduct as any).color && (
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <Paragraph1 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                            Color
                          </Paragraph1>
                          <Paragraph1 className="font-medium text-gray-900 text-sm">
                            {(displayProduct as any).color}
                          </Paragraph1>
                        </div>
                      )}
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <Paragraph1 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                          Item Value
                        </Paragraph1>
                        <Paragraph1 className="font-medium text-gray-900 text-sm">
                          ₦{displayProduct.originalValue?.toLocaleString() || 0}
                        </Paragraph1>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <Paragraph1 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                          {priceInfo.primary.label}
                        </Paragraph1>
                        <Paragraph1 className="font-medium text-gray-900 text-sm">
                          ₦{priceInfo.primary.amount.toLocaleString()}
                        </Paragraph1>
                      </div>
                      {priceInfo.secondary ? (
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <Paragraph1 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                            {priceInfo.secondary.label}
                          </Paragraph1>
                          <Paragraph1 className="font-medium text-gray-900 text-sm">
                            ₦{priceInfo.secondary.amount.toLocaleString()}
                          </Paragraph1>
                        </div>
                      ) : null}
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <Paragraph1 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                          Condition
                        </Paragraph1>
                        <Paragraph1 className="font-medium text-gray-900 text-sm">
                          {displayProduct.condition}
                        </Paragraph1>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <Paragraph1 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                          Quantity
                        </Paragraph1>
                        <Paragraph1 className="font-medium text-gray-900 text-sm">
                          {displayProduct.quantity}
                        </Paragraph1>
                      </div>
                      {(displayProduct as any).measurement && (
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <Paragraph1 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                            Measurement
                          </Paragraph1>
                          <Paragraph1 className="font-medium text-gray-900 text-sm">
                            {(displayProduct as any).measurement}
                          </Paragraph1>
                        </div>
                      )}
                      {(displayProduct as any).composition && (
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <Paragraph1 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                            Composition
                          </Paragraph1>
                          <Paragraph1 className="font-medium text-gray-900 text-sm">
                            {(displayProduct as any).composition}
                          </Paragraph1>
                        </div>
                      )}
                      {(displayProduct as any).material && (
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <Paragraph1 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                            Material
                          </Paragraph1>
                          <Paragraph1 className="font-medium text-gray-900 text-sm">
                            {(displayProduct as any).material}
                          </Paragraph1>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {((displayProduct as any).description ||
                    displayProduct.subText) && (
                    <div>
                      <Paragraph1 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                        Description
                      </Paragraph1>
                      <Paragraph1 className="text-gray-700 text-sm leading-relaxed">
                        {(displayProduct as any).description ||
                          displayProduct.subText}
                      </Paragraph1>
                    </div>
                  )}

                  {/* Sub Categories */}
                  <div>
                    <Paragraph1 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                      Sub Categories
                    </Paragraph1>
                    {subCategoryNames.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {subCategoryNames.map((subCategory) => (
                          <span
                            key={subCategory}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-full font-medium text-gray-700 text-xs"
                          >
                            {subCategory}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <Paragraph1 className="text-gray-500 text-sm">
                        No sub categories assigned
                      </Paragraph1>
                    )}
                  </div>

                  {/* Warning */}
                  {(displayProduct as any).warning && (
                    <div>
                      <Paragraph1 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                        Warning
                      </Paragraph1>
                      <Paragraph1 className="bg-yellow-50 p-3 border border-red-200 rounded text-yellow-700 text-sm leading-relaxed">
                        {(displayProduct as any).warning}
                      </Paragraph1>
                    </div>
                  )}

                  {/* Care Instructions */}
                  {(displayProduct as any).careInstruction && (
                    <div>
                      <Paragraph1 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                        Care Instructions
                      </Paragraph1>
                      <Paragraph1 className="text-gray-700 text-sm leading-relaxed">
                        {(displayProduct as any).careInstruction}
                      </Paragraph1>
                    </div>
                  )}

                  {/* Care Steps */}
                  {(displayProduct as any).careSteps && (
                    <div>
                      <Paragraph1 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                        Care Steps
                      </Paragraph1>
                      <Paragraph1 className="text-gray-700 text-sm leading-relaxed">
                        {(displayProduct as any).careSteps}
                      </Paragraph1>
                    </div>
                  )}

                  {/* Styling Tip */}
                  {(displayProduct as any).stylingTip && (
                    <div>
                      <Paragraph1 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
                        Styling Tip
                      </Paragraph1>
                      <Paragraph1 className="text-gray-700 text-sm leading-relaxed">
                        {(displayProduct as any).stylingTip}
                      </Paragraph1>
                    </div>
                  )}

                  {/* Product Images */}
                  <div>
                    <Paragraph3 className="mb-4 font-bold text-gray-900 text-base">
                      Product Images
                    </Paragraph3>

                    <div className="gap-3 grid grid-cols-4 mb-4">
                      {imagesToDisplay.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="hover:opacity-80 rounded w-full h-32 object-cover transition cursor-pointer"
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setShowImageViewer(true);
                          }}
                        />
                      ))}
                    </div>

                    <div className="hidden space-y-2">
                      <button className="flex justify-center items-center gap-2 hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg w-full font-medium text-gray-700 text-sm transition">
                        <span>👁️</span>
                        View Carousel Profile
                      </button>
                      <button className="flex justify-center items-center gap-2 hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg w-full font-medium text-gray-700 text-sm transition">
                        <span>💬</span>
                        Message via Disputes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "edit" && (
                <div className="space-y-6">
                  <ItemImageUploader />

                  <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                    <BasicInformationForm />
                    <div className="space-y-4">
                      <TagSelector />
                      <ItemDescription />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end gap-3 pt-6 border-gray-200 border-t">
                    <button
                      onClick={() => {
                        reset();
                        setActiveTab("details");
                      }}
                      disabled={updateProduct.isPending}
                      className="hover:bg-gray-50 disabled:opacity-50 px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 text-sm transition disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        updateProduct.mutate(draftData, {
                          onSuccess: () => {
                            toast.success("Product updated successfully!");
                            reset();
                            setActiveTab("details");
                          },
                          onError: (error: any) => {
                            const message =
                              error?.response?.data?.message ||
                              error?.message ||
                              "Failed to update product. Please try again.";
                            toast.error(message);
                          },
                        });
                      }}
                      disabled={updateProduct.isPending}
                      className={`px-6 py-2.5 text-white rounded-lg transition font-medium text-sm flex items-center gap-2 ${
                        updateProduct.isPending
                          ? "cursor-not-allowed bg-gray-400"
                          : "bg-black hover:bg-gray-900"
                      }`}
                    >
                      {updateProduct.isPending ? (
                        <>
                          <div className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check size={18} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "availability" && (
                <AvailabilityTab productId={displayProduct?.id} />
              )}

              {activeTab === "rental-history" && (
                <RentalHistoryTab listerUserId={displayProduct?.curatorId} />
              )}

              {activeTab === "activity" && (
                <ActivityTab productId={displayProduct?.id} />
              )}
            </div>
          </motion.div>

          {/* Approve Confirmation Modal */}
          <AnimatePresence>
            {showApproveModal && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowApproveModal(false)}
                  className="z-50 fixed inset-0 bg-black/50"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", duration: 0.3 }}
                  className="top-1/2 left-1/2 z-50 fixed bg-white shadow-lg mx-4 rounded-xl w-full max-w-md -translate-x-1/2 -translate-y-1/2"
                >
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="top-4 right-4 absolute text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                  <div className="p-8">
                    <div className="flex justify-center mb-6">
                      <div className="flex justify-center items-center bg-green-100 rounded-full w-16 h-16">
                        <CheckCircle size={32} className="text-green-600" />
                      </div>
                    </div>
                    <Paragraph3 className="mb-2 text-gray-900 text-center">
                      Approve Product?
                    </Paragraph3>
                    <Paragraph1 className="mb-8 text-gray-700 text-center">
                      Move "{displayProduct.name}" to active listings. This item
                      will be available for rental.
                    </Paragraph1>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowApproveModal(false)}
                        disabled={isApproving}
                        className="flex-1 hover:bg-gray-50 disabled:opacity-50 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 transition disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (onApprove) {
                            onApprove(displayProduct.id);
                            setShowApproveModal(false);
                            onClose();
                          }
                        }}
                        disabled={isApproving}
                        className="flex flex-1 justify-center items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-3 rounded-lg font-medium text-white transition disabled:cursor-not-allowed"
                      >
                        {isApproving ? (
                          <>
                            <div className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            Approve
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Reject Confirmation Modal */}
          <AnimatePresence>
            {showRejectModal && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowRejectModal(false)}
                  className="z-50 fixed inset-0 bg-black/50"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", duration: 0.3 }}
                  className="top-1/2 left-1/2 z-50 fixed bg-white shadow-lg mx-4 rounded-xl w-full max-w-md -translate-x-1/2 -translate-y-1/2"
                >
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="top-4 right-4 absolute text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                  <div className="p-8">
                    <div className="flex justify-center mb-6">
                      <div className="flex justify-center items-center bg-red-100 rounded-full w-16 h-16">
                        <XCircle size={32} className="text-red-600" />
                      </div>
                    </div>
                    <Paragraph3 className="mb-2 text-gray-900 text-center">
                      Reject Product?
                    </Paragraph3>
                    <Paragraph1 className="mb-4 text-gray-600 text-center">
                      "{displayProduct.name}" will be moved to rejected
                      listings.
                    </Paragraph1>
                    <div className="mb-6">
                      <label className="block mb-2 font-medium text-gray-700 text-sm">
                        Rejection Reason*
                      </label>
                      <textarea
                        value={rejectionComment}
                        onChange={(e) => setRejectionComment(e.target.value)}
                        placeholder="Enter reason for rejection..."
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full min-h-24 text-sm"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowRejectModal(false);
                          setRejectionComment("");
                        }}
                        disabled={isRejecting}
                        className="flex-1 hover:bg-gray-50 disabled:opacity-50 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 transition disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (onReject && rejectionComment.trim()) {
                            onReject(displayProduct.id, rejectionComment);
                            setShowRejectModal(false);
                            setRejectionComment("");
                            onClose();
                          }
                        }}
                        disabled={!rejectionComment.trim() || isRejecting}
                        className="flex flex-1 justify-center items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-3 rounded-lg font-medium text-white transition disabled:cursor-not-allowed"
                      >
                        {isRejecting ? (
                          <>
                            <div className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin" />
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <XCircle size={18} />
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Revert to Pending Confirmation Modal */}
          <AnimatePresence>
            {showSendToPendingModal && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSendToPendingModal(false)}
                  className="z-50 fixed inset-0 bg-black/50"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", duration: 0.3 }}
                  className="top-1/2 left-1/2 z-50 fixed bg-white shadow-lg mx-4 rounded-xl w-full max-w-md -translate-x-1/2 -translate-y-1/2"
                >
                  <button
                    onClick={() => setShowSendToPendingModal(false)}
                    className="top-4 right-4 absolute text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                  <div className="p-8">
                    <div className="flex justify-center mb-6">
                      <div className="flex justify-center items-center bg-amber-100 rounded-full w-16 h-16">
                        <Clock size={32} className="text-amber-600" />
                      </div>
                    </div>
                    <Paragraph3 className="mb-2 text-gray-900 text-center">
                      Revert to pending?
                    </Paragraph3>
                    <Paragraph1 className="mb-8 text-gray-700 text-center">
                      "{displayProduct.name}" will be removed from active
                      listings and moved back to the pending queue.
                    </Paragraph1>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowSendToPendingModal(false)}
                        disabled={isSendingToPending}
                        className="flex-1 hover:bg-gray-50 disabled:opacity-50 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 transition disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (onSendToPending) {
                            onSendToPending(displayProduct.id);
                            setShowSendToPendingModal(false);
                          }
                        }}
                        disabled={isSendingToPending}
                        className="flex flex-1 justify-center items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 px-4 py-3 rounded-lg font-medium text-white whitespace-nowrap transition disabled:cursor-not-allowed"
                      >
                        {isSendingToPending ? (
                          <>
                            <div className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin" />
                            Reverting...
                          </>
                        ) : (
                          <>
                            <Clock size={18} />
                            Revert to Pending
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Disable Confirmation Modal */}
          <AnimatePresence>
            {showDisableModal && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowDisableModal(false)}
                  className="z-50 fixed inset-0 bg-black/50"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", duration: 0.3 }}
                  className="top-1/2 left-1/2 z-50 fixed bg-white shadow-lg mx-4 rounded-xl w-full max-w-md -translate-x-1/2 -translate-y-1/2"
                >
                  <button
                    onClick={() => setShowDisableModal(false)}
                    className="top-4 right-4 absolute text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                  <div className="p-8">
                    <div className="flex justify-center mb-6">
                      <div className="flex justify-center items-center bg-orange-100 rounded-full w-16 h-16">
                        <Power size={32} className="text-orange-600" />
                      </div>
                    </div>
                    <Paragraph3 className="mb-2 text-gray-900 text-center">
                      Disable Product?
                    </Paragraph3>
                    <Paragraph1 className="mb-8 text-gray-700 text-center">
                      "{displayProduct.name}" will be removed from active
                      listings and no longer available for rental.
                    </Paragraph1>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDisableModal(false)}
                        disabled={isDisabling}
                        className="flex-1 hover:bg-gray-50 disabled:opacity-50 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 transition disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (onDisable) {
                            onDisable(displayProduct.id);
                            setShowDisableModal(false);
                          }
                        }}
                        disabled={isDisabling}
                        className="flex flex-1 justify-center items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 px-4 py-3 rounded-lg font-medium text-white transition disabled:cursor-not-allowed"
                      >
                        {isDisabling ? (
                          <>
                            <div className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin" />
                            Disabling...
                          </>
                        ) : (
                          <>
                            <Power size={18} />
                            Disable
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Image Viewer Modal */}
          <AnimatePresence>
            {showImageViewer && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowImageViewer(false)}
                  className="z-[60] fixed inset-0 bg-black/80"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", duration: 0.3 }}
                  className="top-1/2 left-1/2 z-[61] fixed -translate-x-1/2 -translate-y-1/2"
                >
                  {/* Close button */}
                  <button
                    onClick={() => setShowImageViewer(false)}
                    className="-top-12 right-0 absolute text-white hover:text-gray-300 transition"
                  >
                    <X size={32} />
                  </button>

                  {/* Main image */}
                  <div className="relative max-w-2xl max-h-[70vh]">
                    <img
                      src={imagesToDisplay[selectedImageIndex]}
                      alt={`Product image ${selectedImageIndex + 1}`}
                      className="rounded-lg w-full h-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />

                    {/* Previous button */}
                    {selectedImageIndex > 0 && (
                      <button
                        onClick={() =>
                          setSelectedImageIndex(selectedImageIndex - 1)
                        }
                        className="top-1/2 left-0 absolute bg-white/20 hover:bg-white/40 p-3 rounded-lg text-white transition -translate-x-16 -translate-y-1/2"
                      >
                        <ChevronLeft size={24} />
                      </button>
                    )}

                    {/* Next button */}
                    {selectedImageIndex < imagesToDisplay.length - 1 && (
                      <button
                        onClick={() =>
                          setSelectedImageIndex(selectedImageIndex + 1)
                        }
                        className="top-1/2 right-0 absolute bg-white/20 hover:bg-white/40 p-3 rounded-lg text-white transition -translate-y-1/2 translate-x-16"
                      >
                        <ChevronRight size={24} />
                      </button>
                    )}

                    {/* Image counter */}
                    <div className="bottom-4 left-1/2 absolute bg-black/60 px-3 py-2 rounded-lg text-white text-sm -translate-x-1/2">
                      {selectedImageIndex + 1} / {imagesToDisplay.length}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
