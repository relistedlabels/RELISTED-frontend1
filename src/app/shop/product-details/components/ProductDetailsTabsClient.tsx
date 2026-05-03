"use client";

import React, { useState, useEffect } from "react";
import RentalDetailsCard from "./RentalDetailsCard";
import ResaleDetailsCard from "./ResaleDetailsCard";
import { usePublicProductById } from "@/lib/queries/product/usePublicProductById";
import { DetailPanelSkeleton } from "@/common/ui/SkeletonLoaders";

interface ProductDetailsTabsClientProps {
  productId: string;
}

const ProductDetailsTabsClient: React.FC<ProductDetailsTabsClientProps> = ({
  productId,
}) => {
  const { data: product, isLoading } = usePublicProductById(productId);
  const listingType = product?.listingType;

  // Determine available tabs based on listingType
  const hasRent =
    listingType === "RENTAL" ||
    listingType === "RENT_OR_RESALE" ||
    !listingType;
  const hasResale =
    listingType === "RESALE" || listingType === "RENT_OR_RESALE";

  // Set initial active tab based on available options
  const [activeTab, setActiveTab] = useState<"rent" | "resale">(
    hasRent ? "rent" : "resale",
  );

  // Update active tab if current tab becomes unavailable
  useEffect(() => {
    if (activeTab === "rent" && !hasRent && hasResale) {
      setActiveTab("resale");
    } else if (activeTab === "resale" && !hasResale && hasRent) {
      setActiveTab("rent");
    }
  }, [hasRent, hasResale, activeTab]);

  if (isLoading) {
    return <DetailPanelSkeleton />;
  }

  const isSold = product?.status === "SOLD";
  const isRentedOut = product?.status === "RENTED";

  if (isSold && product) {
    const showRentalCard =
      product.listingType === "RENTAL" || !product.listingType;
    return (
      <div>
        <div className="bg-gray-50 mb-4 px-4 py-3 border border-gray-200 rounded-xl">
          <p className="font-semibold text-gray-900">Sold out</p>
          <p className="mt-1 text-gray-600 text-sm leading-relaxed">
            This item is no longer available to rent or buy. Details below are
            for reference only.
          </p>
        </div>
        {showRentalCard ? (
          <RentalDetailsCard productId={productId} />
        ) : (
          <ResaleDetailsCard productId={productId} />
        )}
      </div>
    );
  }

  return (
    <div>


      {/* Tab Buttons - only show if both tabs are available */}
      {hasRent && hasResale && (
        <div className="flex gap-2 bg-white mb-2 p-1 border border-gray-300 rounded-xl text-[14px]">
          <button
            onClick={() => setActiveTab("rent")}
            className={`flex-1 py-3 px-4 font-semibold rounded-lg transition duration-150 ${
              activeTab === "rent"
                ? "bg-black text-white"
                : "bg-transparent text-black hover:bg-gray-50"
            }`}
          >
            Rent
          </button>
          <button
            onClick={() => setActiveTab("resale")}
            className={`flex-1 py-3 px-4 font-semibold rounded-lg transition duration-150 ${
              activeTab === "resale"
                ? "bg-black text-white"
                : "bg-transparent text-black hover:bg-gray-50"
            }`}
          >
            Buy
          </button>
        </div>
      )}

      {/* Switching Message - only show if both tabs are available */}
      {hasRent && hasResale && (
        <div className="mb-6 text-[12px] text-gray-500 text-center">
          {activeTab === "rent" ? (
            <p>Prefer to own it? Switch to Resale.</p>
          ) : (
            <p>Prefer to rent? Switch to Rent.</p>
          )}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "rent" ? (
        <RentalDetailsCard productId={productId} />
      ) : (
        <ResaleDetailsCard productId={productId} />
      )}
    </div>
  );
};

export default ProductDetailsTabsClient;
