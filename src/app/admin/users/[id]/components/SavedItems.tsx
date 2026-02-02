"use client";

import React from "react";
import { Heart } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface SavedItem {
  id: string;
  image: string;
  brand: string;
  title: string;
  price: string;
  rpPrice: string;
}

interface User {
  name: string;
}

interface SavedItemsProps {
  user: User;
}

const SAVED_ITEMS: SavedItem[] = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=350&fit=crop",
    brand: "GUCCI",
    title: "Classic Easy Zipper Tote",
    price: "₦65,000",
    rpPrice: "₦3,800,000",
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=350&fit=crop",
    brand: "DOLCE & GABBANA",
    title: "Concertina Phone Bag",
    price: "Rent from ₦50,000",
    rpPrice: "RP: ₦800,000",
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=350&fit=crop",
    brand: "LOUIS VUITTON",
    title: "Wool Cashmere Sweater Coat",
    price: "₦65,000",
    rpPrice: "RP: ₦900,000",
  },
  {
    id: "4",
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=350&fit=crop",
    brand: "CHANEL",
    title: "Single-Origin Cashmere Beanie",
    price: "₦65,000",
    rpPrice: "RP: ₦900,000",
  },
];

export default function SavedItems({ user }: SavedItemsProps) {
  return (
    <div>
      <Paragraph3 className="text-base font-bold mb-6 text-gray-900">
        Saved Items
      </Paragraph3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {SAVED_ITEMS.map((item) => (
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
                  {item.price}
                </Paragraph1>
                <Paragraph1 className="text-xs text-gray-500">
                  {item.rpPrice}
                </Paragraph1>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
