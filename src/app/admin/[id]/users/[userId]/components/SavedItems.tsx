// ENDPOINTS: GET /api/admin/users/:userId/favorites
"use client";

import React from "react";
import { Heart } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { UserFavorite } from "@/lib/api/admin/users";

interface SavedItemsProps {
  favorites: UserFavorite[];
}

export default function SavedItems({ favorites }: SavedItemsProps) {
  return (
    <div>
      <Paragraph3 className="text-base font-bold mb-6 text-gray-900">
        Saved Items
      </Paragraph3>

      {favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favorites.map((item) => (
            <div key={item.id} className="group cursor-pointer">
              {/* Image Container */}
              <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden h-72">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Heart Icon */}
                <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition">
                  <Heart size={20} className="text-red-600 fill-red-600" />
                </button>
              </div>

              {/* Product Info */}
              <div>
                <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {item.brand}
                </Paragraph1>
                <Paragraph3 className="text-sm font-medium text-gray-900 mb-3 line-clamp-2">
                  {item.title}
                </Paragraph3>

                {/* Price Info */}
                <div className="flex items-baseline gap-2">
                  <Paragraph1 className="text-sm font-semibold text-gray-900">
                    {item.rentalPrice
                      ? `₦${item.rentalPrice.toLocaleString()} rent`
                      : "N/A"}
                  </Paragraph1>
                  <Paragraph1 className="text-xs text-gray-500">
                    RP: ₦{item.retailPrice.toLocaleString()}
                  </Paragraph1>
                </div>

                {/* Status */}
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      item.status === "Available"
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
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
