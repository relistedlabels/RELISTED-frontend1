"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  AlertCircle,
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

import DeleteProductButton from "./DeleteProductButton";

interface ListingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | ProductDetail;
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
}: ListingDetailModalProps) {
  const [activeTab, setActiveTab] = React.useState<
    "details" | "rental-history" | "availability" | "activity"
  >("details");

  // Fetch full product detail when modal is open and we have a product ID
  const { data: productDetail, isLoading } = useListingDetail(
    isOpen && product?.id ? product.id : "",
  );

  // Use full product detail if available, fall back to basic product prop
  const displayProduct = productDetail?.data || product;

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
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
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
                      src={displayProduct.image}
                      alt={displayProduct.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <Paragraph1 className="text-xs text-gray-500 mb-1">
                      {displayProduct.category}
                    </Paragraph1>
                    <Paragraph3 className="text-lg font-bold text-gray-900">
                      {displayProduct.name}
                    </Paragraph3>
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
              <div className="flex gap-2">
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  <Check size={18} />
                  Approve
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  <AlertCircle size={18} />
                  Reject
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  <Edit size={18} />
                  Edit
                </button>
                <DeleteProductButton
                  productId={displayProduct.id}
                  productName={displayProduct.name}
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-white px-6">
              <div className="flex gap-8">
                {[
                  { id: "details", label: "Product Details", icon: Package },
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

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Category
                        </Paragraph1>
                        <Paragraph1 className="text-sm text-gray-900 font-medium">
                          {displayProduct.category}
                        </Paragraph1>
                      </div>
                      {(displayProduct as any).color && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Color
                          </Paragraph1>
                          <Paragraph1 className="text-sm text-gray-900 font-medium">
                            {(displayProduct as any).color}
                          </Paragraph1>
                        </div>
                      )}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Item Value
                        </Paragraph1>
                        <Paragraph1 className="text-sm text-gray-900 font-medium">
                          ₦{displayProduct.originalValue?.toLocaleString() || 0}
                        </Paragraph1>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Price/Day
                        </Paragraph1>
                        <Paragraph1 className="text-sm text-gray-900 font-medium">
                          ₦{displayProduct.dailyPrice?.toLocaleString() || 0}
                        </Paragraph1>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Condition
                        </Paragraph1>
                        <Paragraph1 className="text-sm text-gray-900 font-medium">
                          {displayProduct.condition}
                        </Paragraph1>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Quantity
                        </Paragraph1>
                        <Paragraph1 className="text-sm text-gray-900 font-medium">
                          {displayProduct.quantity}
                        </Paragraph1>
                      </div>
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
                        />
                      ))}
                    </div>

                    <div className="space-y-2">
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

              {activeTab === "availability" && (
                <AvailabilityTab
                  nextAvailableDate="Oct 22, 2025"
                  currentlyRented={true}
                  daysRentedThisMonth={10}
                />
              )}

              {activeTab === "rental-history" && <RentalHistoryTab />}

              {activeTab === "activity" && <ActivityTab />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
