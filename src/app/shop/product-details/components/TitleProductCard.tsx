"use client";

import { Header1Plus, Paragraph1 } from "@/common/ui/Text";
import React from "react";
import SizeGuide from "./SizeGuide";
import { usePublicProductById } from "@/lib/queries/product/usePublicProductById";
import { ProductDetailSkeleton } from "@/common/ui/SkeletonLoaders";

interface TitleProductCardProps {
  productId: string;
}

const TitleProductCard: React.FC<TitleProductCardProps> = ({ productId }) => {
  const { data: product, isLoading, error } = usePublicProductById(productId);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="font-sans">
        <Paragraph1 className="text-gray-700 tracking-wider mb-1">
          Product not found
        </Paragraph1>
      </div>
    );
  }

  return (
    <div className="font-sans">
      {/* Brand Name */}
      <Paragraph1 className="  text-gray-700 tracking-wider mb-1">
        {product.brand.name}
      </Paragraph1>

      {/* Product Name */}
      <Header1Plus className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black mb-1 leading-tight">
        {product.name}
      </Header1Plus>

      {/* Product Description */}
      <Paragraph1 className="text-base sm:text-lg md:text-xl text-gray-700 mb-3">
        {product.color && product.size
          ? `${product.color} ${product.size}`
          : "Premium fashion item"}
      </Paragraph1>

      {/* Ratings and Reviews */}
      <div className="flex items-center mb-5">
        <div className="text-lg sm:text-xl text-yellow-500 mr-2">
          <span aria-label={`${product.rating} star rating`}>
            {"★".repeat(Math.floor(product.rating))}
            {"☆".repeat(5 - Math.floor(product.rating))}
          </span>
        </div>
        <Paragraph1 className="text-base sm:text-lg font-bold text-gray-900 mr-2">
          {product.rating.toFixed(1)}
        </Paragraph1>
        <Paragraph1 className="text-sm sm:text-base text-gray-500">
          ({product.reviews} Reviews)
        </Paragraph1>
      </div>

      {/* Tags and Size Guide */}
      <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap g items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {product.color && (
            <div className="px-3 py-1 whitespace-nowrap   border border-gray-300 rounded-full bg-white text-gray-800">
              <Paragraph1>{product.color}</Paragraph1>
            </div>
          )}
          {product.size && (
            <div className="px-3 py-1 whitespace-nowrap   border border-gray-300 rounded-full bg-white text-gray-800">
              <Paragraph1>Size {product.size}</Paragraph1>
            </div>
          )}
          <div className="px-3 py-1 whitespace-nowrap   border border-gray-300 rounded-full bg-white text-gray-800">
            <Paragraph1>{product.condition}</Paragraph1>
          </div>
        </div>
        <SizeGuide />
      </div>
    </div>
  );
};

export default TitleProductCard;
