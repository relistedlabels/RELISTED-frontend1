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

import DeleteProductButton from "./DeleteProductButton";
import { CategorySelector } from "@/app/listers/components/CategorySelector";
import ItemTypeBadge from "./ItemTypeBadge";

interface ListingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | ProductDetail;
  onApprove?: (productId: string) => void;
  onReject?: (productId: string, comment: string) => void;
  onDisable?: (productId: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  isDisabling?: boolean;
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
  onDisable,
  isApproving = false,
  isRejecting = false,
  isDisabling = false,
}: ListingDetailModalProps) {
  const [activeTab, setActiveTab] = React.useState<
    "details" | "edit" | "rental-history" | "availability" | "activity"
  >("details");
  const [showApproveModal, setShowApproveModal] = React.useState(false);
  const [showRejectModal, setShowRejectModal] = React.useState(false);
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

  // Get images from ProductDetail attachments or fallback to single image
  const imagesToDisplay: string[] = (
    displayProduct as any
  ).attachments?.uploads?.map((u: any) => u.url) || [displayProduct.image];

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
            className="fixed inset-0 bg-black/50  z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-3/4 bg-white z-50 overflow-y-auto shadow-lg"
          >
            {/* Header */}
            <div className="sticky z-50 top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  {isLoading ? (
                    <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center">
                      <Loader
                        size={24}
                        className="text-gray-400 animate-spin"
                      />
                    </div>
                  ) : (
                    <img
                      src={imagesToDisplay[0]}
                      alt={displayProduct.name}
                      className="w-16 h-16 rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <Paragraph1 className="text-xs text-gray-500 mb-1">
                      {(displayProduct as any).brand?.name || "Unknown Brand"}
                    </Paragraph1>
                    <div className="flex items-center gap-2">
                      <Paragraph3 className="text-lg font-bold text-gray-900">
                        {displayProduct.name}
                      </Paragraph3>
                      <ItemTypeBadge
                        listingType={
                          (displayProduct as any).listingType || "RENTAL"
                        }
                      />
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
                    className="text-gray-400 hover:text-gray-600 transition p-1"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex w-fit items-center gap-2">
                {/* Approve Button - Only show for Pending */}
                {displayProduct.status?.toUpperCase() === "PENDING" && (
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    <AlertCircle size={18} />
                    Reject
                  </button>
                )}

                {/* Disable Button - Only show for Active/Approved */}
                {/* {(displayProduct.status?.toUpperCase() === "ACTIVE" ||
                  displayProduct.status?.toUpperCase() === "APPROVED") && (
                  <button
                    onClick={() => setShowDisableModal(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="border-b border-gray-200 bg-white px-6">
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
                    <Paragraph3 className="text-base font-bold text-gray-900 mb-4">
                      Product Details
                    </Paragraph3>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {(displayProduct as any).brand && (
                        <div className=" p-4 rounded-lg border border-gray-200">
                          <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Brand
                          </Paragraph1>
                          <Paragraph1 className="text-sm text-gray-900 font-medium">
                            {(displayProduct as any).brand?.name || "Unknown"}
                          </Paragraph1>
                        </div>
                      )}
                      <div className=" p-4 rounded-lg border border-gray-200">
                        <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Category
                        </Paragraph1>
                        <Paragraph1 className="text-sm text-gray-900 font-medium">
                          {typeof displayProduct.category === "string"
                            ? displayProduct.category
                            : displayProduct.category?.name || "Uncategorized"}
                        </Paragraph1>
                      </div>
                      {(displayProduct as any).color && (
                        <div className=" p-4 rounded-lg border border-gray-200">
                          <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Color
                          </Paragraph1>
                          <Paragraph1 className="text-sm text-gray-900 font-medium">
                            {(displayProduct as any).color}
                          </Paragraph1>
                        </div>
                      )}
                      <div className=" p-4 rounded-lg border border-gray-200">
                        <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Item Value
                        </Paragraph1>
                        <Paragraph1 className="text-sm text-gray-900 font-medium">
                          ₦{displayProduct.originalValue?.toLocaleString() || 0}
                        </Paragraph1>
                      </div>
                      <div className=" p-4 rounded-lg border border-gray-200">
                        <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Price/Day
                        </Paragraph1>
                        <Paragraph1 className="text-sm text-gray-900 font-medium">
                          ₦{displayProduct.dailyPrice?.toLocaleString() || 0}
                        </Paragraph1>
                      </div>
                      <div className=" p-4 rounded-lg border border-gray-200">
                        <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Condition
                        </Paragraph1>
                        <Paragraph1 className="text-sm text-gray-900 font-medium">
                          {displayProduct.condition}
                        </Paragraph1>
                      </div>
                      <div className=" p-4 rounded-lg border border-gray-200">
                        <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Quantity
                        </Paragraph1>
                        <Paragraph1 className="text-sm text-gray-900 font-medium">
                          {displayProduct.quantity}
                        </Paragraph1>
                      </div>
                      {(displayProduct as any).measurement && (
                        <div className=" p-4 rounded-lg border border-gray-200">
                          <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Measurement
                          </Paragraph1>
                          <Paragraph1 className="text-sm text-gray-900 font-medium">
                            {(displayProduct as any).measurement}
                          </Paragraph1>
                        </div>
                      )}
                      {(displayProduct as any).composition && (
                        <div className=" p-4 rounded-lg border border-gray-200">
                          <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Composition
                          </Paragraph1>
                          <Paragraph1 className="text-sm text-gray-900 font-medium">
                            {(displayProduct as any).composition}
                          </Paragraph1>
                        </div>
                      )}
                      {(displayProduct as any).material && (
                        <div className=" p-4 rounded-lg border border-gray-200">
                          <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Material
                          </Paragraph1>
                          <Paragraph1 className="text-sm text-gray-900 font-medium">
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
                      <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Description
                      </Paragraph1>
                      <Paragraph1 className="text-sm text-gray-700 leading-relaxed">
                        {(displayProduct as any).description ||
                          displayProduct.subText}
                      </Paragraph1>
                    </div>
                  )}

                  {/* Sub Categories */}
                  <div>
                    <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Sub Categories
                    </Paragraph1>
                    {subCategoryNames.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {subCategoryNames.map((subCategory) => (
                          <span
                            key={subCategory}
                            className="inline-flex items-center rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700"
                          >
                            {subCategory}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <Paragraph1 className="text-sm text-gray-500">
                        No sub categories assigned
                      </Paragraph1>
                    )}
                  </div>

                  {/* Warning */}
                  {(displayProduct as any).warning && (
                    <div>
                      <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Warning
                      </Paragraph1>
                      <Paragraph1 className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded border border-red-200 leading-relaxed">
                        {(displayProduct as any).warning}
                      </Paragraph1>
                    </div>
                  )}

                  {/* Care Instructions */}
                  {(displayProduct as any).careInstruction && (
                    <div>
                      <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Care Instructions
                      </Paragraph1>
                      <Paragraph1 className="text-sm text-gray-700 leading-relaxed">
                        {(displayProduct as any).careInstruction}
                      </Paragraph1>
                    </div>
                  )}

                  {/* Care Steps */}
                  {(displayProduct as any).careSteps && (
                    <div>
                      <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Care Steps
                      </Paragraph1>
                      <Paragraph1 className="text-sm text-gray-700 leading-relaxed">
                        {(displayProduct as any).careSteps}
                      </Paragraph1>
                    </div>
                  )}

                  {/* Styling Tip */}
                  {(displayProduct as any).stylingTip && (
                    <div>
                      <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Styling Tip
                      </Paragraph1>
                      <Paragraph1 className="text-sm text-gray-700 leading-relaxed">
                        {(displayProduct as any).stylingTip}
                      </Paragraph1>
                    </div>
                  )}

                  {/* Product Images */}
                  <div>
                    <Paragraph3 className="text-base font-bold text-gray-900 mb-4">
                      Product Images
                    </Paragraph3>

                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {imagesToDisplay.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 rounded object-cover cursor-pointer hover:opacity-80 transition"
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setShowImageViewer(true);
                          }}
                        />
                      ))}
                    </div>

                    <div className="space-y-2 hidden">
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm">
                        <span>👁️</span>
                        View Carousel Profile
                      </button>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <BasicInformationForm />
                    <div className="space-y-4">
                      <TagSelector />
                      <ItemDescription />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        reset();
                        setActiveTab("details");
                      }}
                      disabled={updateProduct.isPending}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                  className="fixed inset-0 bg-black/50 z-50"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", duration: 0.3 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg z-50 w-full max-w-md mx-4"
                >
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                  <div className="p-8">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle size={32} className="text-green-600" />
                      </div>
                    </div>
                    <Paragraph3 className="text-center text-gray-900 mb-2">
                      Approve Product?
                    </Paragraph3>
                    <Paragraph1 className="text-center text-gray-700 mb-8">
                      Move "{displayProduct.name}" to active listings. This item
                      will be available for rental.
                    </Paragraph1>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowApproveModal(false)}
                        disabled={isApproving}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isApproving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                  className="fixed inset-0 bg-black/50 z-50"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", duration: 0.3 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg z-50 w-full max-w-md mx-4"
                >
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                  <div className="p-8">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle size={32} className="text-red-600" />
                      </div>
                    </div>
                    <Paragraph3 className="text-center text-gray-900 mb-2">
                      Reject Product?
                    </Paragraph3>
                    <Paragraph1 className="text-center text-gray-600 mb-4">
                      "{displayProduct.name}" will be moved to rejected
                      listings.
                    </Paragraph1>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason*
                      </label>
                      <textarea
                        value={rejectionComment}
                        onChange={(e) => setRejectionComment(e.target.value)}
                        placeholder="Enter reason for rejection..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-24 text-sm"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowRejectModal(false);
                          setRejectionComment("");
                        }}
                        disabled={isRejecting}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isRejecting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

          {/* Disable Confirmation Modal */}
          <AnimatePresence>
            {showDisableModal && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowDisableModal(false)}
                  className="fixed inset-0 bg-black/50 z-50"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", duration: 0.3 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg z-50 w-full max-w-md mx-4"
                >
                  <button
                    onClick={() => setShowDisableModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                  <div className="p-8">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                        <Power size={32} className="text-orange-600" />
                      </div>
                    </div>
                    <Paragraph3 className="text-center text-gray-900 mb-2">
                      Disable Product?
                    </Paragraph3>
                    <Paragraph1 className="text-center text-gray-700 mb-8">
                      "{displayProduct.name}" will be removed from active
                      listings and no longer available for rental.
                    </Paragraph1>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDisableModal(false)}
                        disabled={isDisabling}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isDisabling ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                  className="fixed inset-0 bg-black/80 z-[60]"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", duration: 0.3 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[61]"
                >
                  {/* Close button */}
                  <button
                    onClick={() => setShowImageViewer(false)}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
                  >
                    <X size={32} />
                  </button>

                  {/* Main image */}
                  <div className="relative max-w-2xl max-h-[70vh]">
                    <img
                      src={imagesToDisplay[selectedImageIndex]}
                      alt={`Product image ${selectedImageIndex + 1}`}
                      className="w-full h-auto rounded-lg object-contain"
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
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 bg-white/20 hover:bg-white/40 text-white p-3 rounded-lg transition"
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
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 bg-white/20 hover:bg-white/40 text-white p-3 rounded-lg transition"
                      >
                        <ChevronRight size={24} />
                      </button>
                    )}

                    {/* Image counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-2 rounded-lg text-sm">
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
