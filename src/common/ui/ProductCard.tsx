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
import { productDetailHref } from "@/lib/shop/productDetailLinks";

export type ProductCardPriceFocus = "rent" | "buy";

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
  /** Shop Rent/Buy toggle focus; defaults to rent-first for dual listings. */
  priceFocus?: ProductCardPriceFocus;
  /** Resale sold — still shown in closet/shop closet views, greyed out */
  isSold?: boolean;
  /** Active rental in progress — greyed out; rent blocked on PDP */
  isRentedOut?: boolean;
}

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString()}`;
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <Paragraph1 className="text-gray-700">{label}</Paragraph1>
      <Paragraph1 className="shrink-0 font-semibold text-black tabular-nums">
        {value}
      </Paragraph1>
    </div>
  );
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
  priceFocus = "rent",
  isSold = false,
  isRentedOut = false,
}: ProductCardProps) {
  const router = useRouter();
  const priceInfo = listingPriceDisplay({ listingType, dailyPrice, resalePrice });
  const type = priceInfo.listingType;
  const rentAmount = dailyPrice ?? priceInfo.primary.amount;
  const buyAmount = resalePrice ?? priceInfo.secondary?.amount ?? 0;
  const addViewed = useBrowseStore((state) => state.addViewed);

  const { data: user } = useMe();
  const { data: favoritesData } = useFavorites(1, 100);
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (favoritesData?.favorites) {
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
      const fav = favoritesData?.favorites.find((fav) => fav.productId === id);
      if (fav) {
        removeFavorite.mutate(fav.productId);
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
    router.push(
      productDetailHref(id, priceFocus === "buy" ? "buy" : undefined),
    );
  };

  const isDimmed = isSold || isRentedOut;
  const heroSrc = cloudinaryOptimizedImageUrl(image, { preset: "card" });
  const closetSrc = closetImage
    ? cloudinaryOptimizedImageUrl(closetImage, { preset: "thumb" })
    : null;
  const sizeLabel = size || measurement;
  const brandLabel = brand.trim();
  const rentPrice = `${formatNaira(rentAmount)}/day`;
  const buyPrice = formatNaira(buyAmount);

  const showRent = type === "RENTAL" || type === "RENT_OR_RESALE";
  const showBuy = type === "RESALE" || (type === "RENT_OR_RESALE" && buyAmount > 0);

  return (
    <div
      className={`cursor-pointer overflow-hidden ${isDimmed ? "opacity-[0.58] grayscale" : ""}`}
      onClick={handleProductClick}
    >
      <div className="relative h-[260px] w-full sm:h-[300px]">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url("${heroSrc}")` }}
        />

        {isSold ? (
          <div className="absolute left-3 top-3 z-10 rounded bg-black/75 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            Sold
          </div>
        ) : isRentedOut ? (
          <div className="absolute left-3 top-3 z-10 rounded bg-amber-900/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
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
          className={`absolute right-3 top-3 rounded-full bg-black/20 p-1.5 backdrop-blur-sm transition hover:bg-white disabled:opacity-50 ${isDimmed ? "hidden" : ""}`}
        >
          <Heart
            className="h-5 w-5"
            fill={isFavorited ? "red" : "none"}
            color={isFavorited ? "red" : "white"}
          />
        </button>
      </div>

      <div className="space-y-1.5 py-4">
        {brandLabel ? (
          <Paragraph1 className="truncate text-[11px] font-medium tracking-wide text-gray-500">
            {brandLabel}
          </Paragraph1>
        ) : null}
        <Paragraph1 className="line-clamp-2 text-xs font-semibold text-gray-900">
          {name}
        </Paragraph1>

        {closetOwner ? (
          <div className="flex items-center justify-between gap-2 pt-1">
            <Paragraph1 className="text-xs text-gray-700">Closet</Paragraph1>
            <div className="flex min-w-0 items-center gap-1">
              <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-gray-200">
                {closetSrc ? (
                  <Image
                    src={closetSrc}
                    alt={closetOwner}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[9px] font-bold text-gray-600">
                    {closetOwner.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <Paragraph1 className="truncate text-xs font-medium text-gray-700">
                {closetOwner}
              </Paragraph1>
            </div>
          </div>
        ) : null}

        {sizeLabel ? (
          <Paragraph1 className="text-gray-700">Size {sizeLabel}</Paragraph1>
        ) : null}

        <div className="space-y-1.5 pt-1">
          {priceFocus === "buy" ? (
            <>
              {showBuy ? <PriceRow label="Buy" value={buyPrice} /> : null}
              {showRent && type === "RENT_OR_RESALE" ? (
                <PriceRow label="Rent" value={rentPrice} />
              ) : null}
            </>
          ) : (
            <>
              {showRent ? <PriceRow label="Rent" value={rentPrice} /> : null}
              {showBuy && type === "RENT_OR_RESALE" ? (
                <PriceRow label="Buy" value={buyPrice} />
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
