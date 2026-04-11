"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useBrowseStore } from "@/store/useBrowseStore";
import { Paragraph1 } from "./Text";
import { Heart } from "lucide-react";
import {
  useAddFavorite,
  useRemoveFavorite,
  useFavorites,
} from "@/lib/queries/renters/useFavorites";
import { useMe } from "@/lib/queries/auth/useMe";

interface ProductCardProps {
  id: string;
  image: string;
  brand: string;
  name: string;
  price: string;
  dailyPrice?: number;
  resalePrice?: number | null;
  listingType?: "RENTAL" | "RESALE" | "RENT_OR_RESALE";
  size?: string;
  measurement?: string;
}

export default function ProductCard({
  id,
  image,
  brand,
  name,
  price,
  dailyPrice,
  resalePrice,
  listingType = "RENTAL",
  size,
  measurement,
}: ProductCardProps) {
  const router = useRouter();
  const addViewed = useBrowseStore((state) => state.addViewed);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { data: user } = useMe();
  const { data: favoritesData } = useFavorites(1, 100);
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (favoritesData?.favorites) {
      // API returns favorite.productId, not itemId
      const isFav = favoritesData.favorites.some((fav) => fav.productId === id);
      setIsFavorited(isFav);
    }
  }, [favoritesData, id]);

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/auth/sign-in");
      return;
    }

    if (isFavorited) {
      // Find the favoriteId for this product
      const fav = favoritesData?.favorites.find((fav) => fav.productId === id);
      if (fav) {
        removeFavorite.mutate(fav.productId); // API expects productId for removal
        setIsFavorited(false);
      }
    } else {
      addFavorite.mutate(id);
      setIsFavorited(true);
    }
  };

  const handleProductClick = () => {
    addViewed({
      id,
      image,
      brand,
      name,
      price,
      measurement: size || measurement,
    });
    router.push(`/shop/product-details/${id}`);
  };

  return (
    <div
      className="overflow-hidden cursor-pointer"
      onClick={handleProductClick}
    >
      <div className="relative w-full h-[260px] sm:h-[300px]">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />

        <button
          onClick={handleFavoriteClick}
          disabled={addFavorite.isPending || removeFavorite.isPending}
          className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition disabled:opacity-50"
        >
          <Heart
            className="w-5 h-5"
            fill={isFavorited ? "red" : "none"}
            color={isFavorited ? "red" : "white"}
          />
        </button>

        {/* Rent and Resale badges */}
        <div className="absolute bottom-3 left-3 flex">
          {(listingType === "RENTAL" || listingType === "RENT_OR_RESALE") && (
            <span
              className={`bg-white text-black px-2.5 py-1 ${
                listingType === "RENT_OR_RESALE"
                  ? "rounded-l-full"
                  : "rounded-full"
              } text-[10px] border border-black font-semibold`}
            >
              RENT
            </span>
          )}
          {(listingType === "RESALE" || listingType === "RENT_OR_RESALE") && (
            <span
              className={`bg-black text-white px-2.5 py-1 ${
                listingType === "RENT_OR_RESALE"
                  ? "rounded-r-full"
                  : "rounded-full"
              } text-[10px] border border-black font-semibold`}
            >
              RESALE
            </span>
          )}
        </div>
      </div>

      {/* product description */}
      <div className="py-4">
        <Paragraph1 className="text-xs font-semibold tracking-wide">
          {brand ? `${brand} ${name}` : name}
        </Paragraph1>
        {(size || measurement) && (
          <Paragraph1 className="text-gray-700 mt-1">
            Size: {size || measurement}
          </Paragraph1>
        )}
        {listingType === "RESALE" ? (
          // Resale-only pricing
          <div className="flex justify-between items-start">
            <Paragraph1 className="text-gray-700">Price</Paragraph1>
            <Paragraph1 className="text-black font-semibold">
              ₦{resalePrice?.toLocaleString() || "0"}
            </Paragraph1>
          </div>
        ) : listingType === "RENTAL" ? (
          // Rental-only pricing
          <div className="flex justify-between items-start">
            <Paragraph1 className="text-gray-700">Rent from </Paragraph1>
            <Paragraph1 className="text-black font-semibold">
              ₦{dailyPrice?.toLocaleString() || "0"}
            </Paragraph1>
          </div>
        ) : (
          // Rent or Resale - show rental price as primary
          <div className="flex justify-between items-start">
            <Paragraph1 className="text-gray-700">Rent from </Paragraph1>
            <Paragraph1 className="text-black font-semibold">
              ₦{dailyPrice?.toLocaleString() || "0"}
            </Paragraph1>
          </div>
        )}
        <div className="flex justify-between items-start mt-2">
          <Paragraph1 className="text-gray-600 ">RRP:</Paragraph1>
          <Paragraph1 className="text-gray-600 line-through">
            {price}
          </Paragraph1>
        </div>
      </div>
    </div>
  );
}
