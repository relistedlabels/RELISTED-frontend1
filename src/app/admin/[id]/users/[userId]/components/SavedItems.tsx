// ENDPOINTS: GET /api/admin/users/:userId/favorites
"use client";

import React from "react";
import { Heart } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { UserFavorite } from "@/lib/api/admin/users";
import { usePublicProductById } from "@/lib/queries/product/usePublicProductById";

interface SavedItemsProps {
  favorites: UserFavorite[];
}

// Product image component
const FavoriteProductCard: React.FC<{ favorite: UserFavorite }> = ({
  favorite,
}) => {
  const { data: publicProduct, isLoading } = usePublicProductById(
    favorite.productId,
  );
  const firstImageUrl = publicProduct?.attachments?.uploads?.[0]?.url;
  const product = favorite.product;

  return (
    <div className="group cursor-pointer">
      {/* Image Container */}
      <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden h-72">
        {isLoading ? (
          <div className="w-full h-full bg-gray-200 animate-pulse" />
        ) : firstImageUrl ? (
          <img
            src={firstImageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-xs text-gray-600">No image</span>
          </div>
        )}
        {/* Heart Icon */}
        <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition">
          <Heart size={20} className="text-red-600 fill-red-600" />
        </button>
      </div>

      {/* Product Info */}
      <div>
        <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {product.condition}
        </Paragraph1>
        <Paragraph3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </Paragraph3>

        {/* Price & Condition */}
        <div className="flex items-baseline gap-2 mb-2">
          <Paragraph1 className="text-sm font-semibold text-gray-900">
            ₦{product.dailyPrice.toLocaleString()}/day
          </Paragraph1>
          <Paragraph1 className="text-xs text-gray-500">
            Value: ₦{(product.originalValue || 0).toLocaleString()}
          </Paragraph1>
        </div>

        {/* Status & Saved Date */}
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded ${
              product.status === "AVAILABLE"
                ? "bg-green-50 text-green-700"
                : product.status === "PENDING"
                  ? "bg-yellow-50 text-yellow-700"
                  : product.status === "APPROVED"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-red-50 text-red-700"
            }`}
          >
            {product.status}
          </span>
          <Paragraph1 className="text-xs text-gray-500">
            {new Date(favorite.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
            })}
          </Paragraph1>
        </div>
      </div>
    </div>
  );
};

export default function SavedItems({ favorites }: SavedItemsProps) {
  return (
    <div>
      <Paragraph3 className="text-base font-bold mb-6 text-gray-900">
        Saved Items
      </Paragraph3>

      {favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favorites.map((favorite) => (
            <FavoriteProductCard key={favorite.id} favorite={favorite} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart size={40} className="mx-auto text-gray-300 mb-4" />
          <Paragraph1 className="text-gray-500">No saved items yet</Paragraph1>
        </div>
      )}
    </div>
  );
}
