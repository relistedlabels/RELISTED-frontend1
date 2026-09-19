"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import RentalDetailsCard from "./RentalDetailsCard";
import ResaleDetailsCard from "./ResaleDetailsCard";
import { usePublicProductById } from "@/lib/queries/product/usePublicProductById";
import { DetailPanelSkeleton } from "@/common/ui/SkeletonLoaders";
import { resolveProductDetailTab } from "@/lib/shop/productDetailLinks";

interface ProductDetailsTabsClientProps {
  productId: string;
}

const ProductDetailsTabsClient: React.FC<ProductDetailsTabsClientProps> = ({
  productId,
}) => {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const { data: product, isLoading } = usePublicProductById(productId);
  const listingType = product?.listingType;
  const productLoaded = !isLoading && product != null;

  // Determine available tabs based on listingType
  const hasRent =
    listingType === "RENTAL" ||
    listingType === "RENT_OR_RESALE" ||
    !listingType;
  const hasResale =
    listingType === "RESALE" || listingType === "RENT_OR_RESALE";

  const [activeTab, setActiveTab] = useState<"rent" | "resale">("rent");
  const [tabInitialized, setTabInitialized] = useState(false);

  // Apply default tab once listing type is known (respects ?mode=buy from shop)
  useEffect(() => {
    if (!productLoaded || tabInitialized) return;
    setActiveTab(resolveProductDetailTab(modeParam, hasRent, hasResale));
    setTabInitialized(true);
  }, [productLoaded, tabInitialized, modeParam, hasRent, hasResale]);

  // Update active tab if current tab becomes unavailable
  useEffect(() => {
    if (!productLoaded) return;
    if (activeTab === "rent" && !hasRent && hasResale) {
      setActiveTab("resale");
    } else if (activeTab === "resale" && !hasResale && hasRent) {
      setActiveTab("rent");
    }
  }, [hasRent, hasResale, activeTab, productLoaded]);

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
    <div className="flex flex-col gap-2 sm:gap-3">
      {/* Tab Buttons - only show if both tabs are available */}
      {hasRent && hasResale && (
        <div className="flex gap-1 rounded-xl border border-gray-300 bg-white p-0.5 text-[14px] sm:gap-2 sm:p-1">
          <button
            onClick={() => setActiveTab("rent")}
            className={`flex-1 rounded-lg px-3 py-2.5 font-semibold transition duration-150 sm:px-4 sm:py-3 ${
              activeTab === "rent"
                ? "bg-black text-white"
                : "bg-transparent text-black hover:bg-gray-50"
            }`}
          >
            Rent
          </button>
          <button
            onClick={() => setActiveTab("resale")}
            className={`flex-1 rounded-lg px-3 py-2.5 font-semibold transition duration-150 sm:px-4 sm:py-3 ${
              activeTab === "resale"
                ? "bg-black text-white"
                : "bg-transparent text-black hover:bg-gray-50"
            }`}
          >
            Buy
          </button>
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
