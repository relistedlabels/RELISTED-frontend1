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
import { cloudinaryOptimizedImageUrl } from "@/lib/media/cloudinaryOptimizedImageUrl";
import { listingPriceDisplay } from "@/lib/product/listingPriceDisplay";

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
  closetOwner?: string;
  closetImage?: string;
  /** Resale sold — still shown in closet/shop closet views, greyed out */
  isSold?: boolean;
  /** Active rental in progress — greyed out; rent blocked on PDP */
  isRentedOut?: boolean;
}

export default function ProductCard({
  id,
  image,
  brand,
  name,
  price,
  dailyPrice,
  resalePrice,
  listingType,
  size,
  measurement,
  closetOwner,
  closetImage,
  isSold = false,
  isRentedOut = false,
}: ProductCardProps) {
  const router = useRouter();
  const priceInfo = listingPriceDisplay({ listingType, dailyPrice, resalePrice });
  const type = priceInfo.listingType;
  const addViewed = useBrowseStore((state) => state.addViewed);

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

    if (isSold || isRentedOut) return;

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
      isSold,
      isRentedOut,
    });
    router.push(`/shop/product-details/${id}`);
  };

  const isDimmed = isSold || isRentedOut;
  const heroSrc = cloudinaryOptimizedImageUrl(image, { maxWidth: 800 });
  const closetSrc = closetImage
    ? cloudinaryOptimizedImageUrl(closetImage, { maxWidth: 128 })
    : null;

  return (
    <div
      className={`overflow-hidden cursor-pointer ${isDimmed ? "opacity-[0.58] grayscale" : ""}`}
      onClick={handleProductClick}
    >
      <div className="relative w-full h-[260px] sm:h-[300px]">
        <div
          className="bg-cover bg-center w-full h-full"
          style={{ backgroundImage: `url("${heroSrc}")` }}
        />

        {isSold ? (
          <div className="top-3 left-3 z-10 absolute bg-black/75 px-2.5 py-1 rounded font-semibold text-[10px] text-white uppercase tracking-wider">
            Sold
          </div>
        ) : isRentedOut ? (
          <div className="top-3 left-3 z-10 absolute bg-amber-900/90 px-2.5 py-1 rounded font-semibold text-[10px] text-white uppercase tracking-wider">
            Rented
          </div>
        ) : null}

        <button
          onClick={handleFavoriteClick}
          disabled={
            isSold ||
            isRentedOut ||
            addFavorite.isPending ||
            removeFavorite.isPending
          }
          className={`absolute top-3 right-3 bg-black/20 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition disabled:opacity-50 ${isDimmed ? "hidden" : ""}`}
        >
          <Heart
            className="w-5 h-5"
            fill={isFavorited ? "red" : "none"}
            color={isFavorited ? "red" : "white"}
          />
        </button>

        {/* Rent and Resale badges */}
        <div className="hidden bottom-3 left-3 absolute flex-">
          {(type === "RENTAL" || type === "RENT_OR_RESALE") && (
            <span
              className={`bg-white text-black px-2.5 py-1 ${
                type === "RENT_OR_RESALE"
                  ? "rounded-l-full"
                  : "rounded-full"
              } text-[10px] border border-black font-semibold`}
            >
              RENT
            </span>
          )}
          {(type === "RESALE" || type === "RENT_OR_RESALE") && (
            <span
              className={`bg-black text-white px-2.5 py-1 ${
                type === "RENT_OR_RESALE"
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
        <Paragraph1 className="font-semibold text-xs tracking-wide">
          {brand ? `${brand} ${name}` : name}
        </Paragraph1>
        {closetOwner ? (
          <div className="flex justify-between items-center gap-2 mt-3 mb-1">
            <Paragraph1 className="text-gray-700 text-xs">Closet:</Paragraph1>
            <div className="flex items-center gap-1 min-w-0">
              <div className="relative bg-gray-200 rounded-full w-6 h-6 overflow-hidden shrink-0">
                {closetSrc ? (
                  <Image
                    src={closetSrc}
                    alt={closetOwner}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="flex justify-center items-center w-full h-full font-bold text-[9px] text-gray-600">
                    {closetOwner.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <Paragraph1 className="font-medium text-gray-700 text-xs truncate">
                {closetOwner}
              </Paragraph1>
            </div>
          </div>
        ) : null}{" "}
        {(size || measurement) && (
          <Paragraph1 className="mt-1 text-gray-700">
            Size: {size || measurement}
          </Paragraph1>
        )}
        {type === "RESALE" ? (
          <div className="flex justify-between items-start">
            <Paragraph1 className="text-gray-700">Buy</Paragraph1>
            <Paragraph1 className="font-semibold text-black">
              ₦{priceInfo.primary.amount.toLocaleString()}
            </Paragraph1>
          </div>
        ) : type === "RENTAL" ? (
          <div className="flex justify-between items-start">
            <Paragraph1 className="text-gray-700">Rent from </Paragraph1>
            <Paragraph1 className="font-semibold text-black">
              ₦{priceInfo.primary.amount.toLocaleString()}
            </Paragraph1>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start">
              <Paragraph1 className="text-gray-700">Rent from </Paragraph1>
              <Paragraph1 className="font-semibold text-black">
                ₦{priceInfo.primary.amount.toLocaleString()}
              </Paragraph1>
            </div>
            <div className="flex justify-between items-start mt-1">
              <Paragraph1 className="text-gray-700">Buy </Paragraph1>
              <Paragraph1 className="font-semibold text-black">
                ₦{(priceInfo.secondary?.amount ?? 0).toLocaleString()}
              </Paragraph1>
            </div>
          </div>
        )}
        <div className="flex justify-between items-start mt-1">
          <Paragraph1 className="text-gray-600">RRP:</Paragraph1>
          <Paragraph1 className="text-gray-600 line-through">
            {price}
          </Paragraph1>
        </div>
      </div>
    </div>
  );
}
