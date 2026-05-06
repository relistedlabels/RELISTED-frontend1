"use client";

import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import React from "react";
import SizeGuide from "./SizeGuide";
import { usePublicProductById } from "@/lib/queries/product/usePublicProductById";
import { useBrandById } from "@/lib/queries/brand/useBrands";
import { usePublicUserById } from "@/lib/queries/user/usePublicUserById";
import { ProductDetailSkeleton } from "@/common/ui/SkeletonLoaders";

interface TitleProductCardProps {
  productId: string;
}

const TitleProductCard: React.FC<TitleProductCardProps> = ({ productId }) => {
  console.log("🎯 TitleProductCard: Mounted with productId:", productId);
  const { data: product, isLoading, error } = usePublicProductById(productId);

  // Fetch brand by brandId if available
  const { data: brand } = useBrandById(product?.brandId || "");

  // Fetch curator (lister) by curatorId if available
  const { data: curator } = usePublicUserById(product?.curatorId || "");

  console.log(
    "🎯 TitleProductCard: Query state - isLoading:",
    isLoading,
    "hasError:",
    !!error,
    "product:",
    product,
  );

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="font-sans">
        <Paragraph1 className="mb-1 text-gray-700 tracking-wider">
          Product not found
        </Paragraph1>
      </div>
    );
  }

  return (
    <div className="font-sans">
      {/* Brand Name */}
      <Paragraph1 className="mb-1 text-gray-700 tracking-wider">
        {brand?.name || product.brand?.name || "Brand"}
      </Paragraph1>

      {/* Product Name */}
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <Header1Plus className="font-extrabold text-black text-2xl sm:text-3xl md:text-4xl leading-tight">
          {product.name}
        </Header1Plus>
        {product.status === "SOLD" ? (
          <span className="inline-flex items-center bg-neutral-800 px-2.5 py-0.5 rounded-full font-semibold text-[11px] text-white uppercase tracking-wide">
            Sold out
          </span>
        ) : product.status === "RENTED" ? (
          <span className="inline-flex items-center bg-amber-800 px-2.5 py-0.5 rounded-full font-semibold text-[11px] text-white uppercase tracking-wide">
            Rented out
          </span>
        ) : null}
      </div>

      {/* Product Description */}
      <Paragraph1 className="mb-3 text-gray-700 text-base sm:text-lg md:text-xl">
        {product.color && product.measurement
          ? `${product.color} / ${product.measurement}`
          : product.color || "Premium fashion item"}
      </Paragraph1>

      {/* Ratings and Reviews - Default values if not available */}
      <div className="flex items-center mb-5">
        <div className="mr-2 text-yellow-500 text-lg sm:text-xl">
          <span aria-label={`4.5 star rating`}>
            {"★".repeat(4)}
            {"☆".repeat(1)}
          </span>
        </div>
        <Paragraph1 className="mr-2 font-bold text-gray-900 text-base sm:text-lg">
          4.5
        </Paragraph1>
        <Paragraph1 className="text-gray-500 text-sm sm:text-base">
          (0 Reviews)
        </Paragraph1>
      </div>

      {/* Tags and Size Guide */}
      <div className="flex sm:flex-row flex-col sm:justify-between items-start sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2 pb-1 overflow-x-auto g no-scrollbar">
          {product.color && (
            <div className="bg-white px-3 py-1 border border-gray-300 rounded-full text-gray-800 whitespace-nowrap">
              <Paragraph1>{product.color}</Paragraph1>
            </div>
          )}
          {product.measurement && (
            <div className="bg-white px-3 py-1 border border-gray-300 rounded-full text-gray-800 whitespace-nowrap">
              <Paragraph1>Size {product.measurement}</Paragraph1>
            </div>
          )}
          <div className="bg-white px-3 py-1 border border-gray-300 rounded-full text-gray-800 whitespace-nowrap">
            <Paragraph1>{product.condition}</Paragraph1>
          </div>
        </div>
        <SizeGuide />
      </div>
    </div>
  );
};

export default TitleProductCard;
