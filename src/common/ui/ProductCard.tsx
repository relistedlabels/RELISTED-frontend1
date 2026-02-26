"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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
}

export default function ProductCard({
  id,
  image,
  brand,
  name,
  price,
  dailyPrice,
}: ProductCardProps) {
  const { data: user } = useMe();
  const { data: favoritesData } = useFavorites(1, 100);
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const [isFavorited, setIsFavorited] = useState(false);

  // Check if this item is in favorites
  useEffect(() => {
    if (favoritesData?.favorites) {
      const isFav = favoritesData.favorites.some((fav) => fav.itemId === id);
      setIsFavorited(isFav);
    }
  }, [favoritesData, id]);

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to sign in if not logged in
      window.location.href = "/auth/sign-in";
      return;
    }

    if (isFavorited) {
      removeFavorite.mutate(id);
      setIsFavorited(false);
    } else {
      addFavorite.mutate(id);
      setIsFavorited(true);
    }
  };

  return (
    <Link href={`/shop/product-details/${id}`} className="overflow-hidden">
      {/* Image wrapper */}
      <div className="relative w-full h-[230px] sm:h-[270px]">
        {/* Background image */}
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        ></div>

        {/* Love icon */}
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
      </div>

      <div className="py-4">
        <Paragraph1 className="text-xs font-semibold tracking-wide">
          {brand}
        </Paragraph1>
        <Paragraph1 className="text-gray-700 mt-1">{name}</Paragraph1>
        <Paragraph1 className=" text-gray-700- mt-2">
          Rent from{" "}
          <span className=" text-black font-semibold">
            ₦{dailyPrice?.toLocaleString() || "0"}{" "}
          </span>
        </Paragraph1>
        <Paragraph1 className="text-gray-400 mt-2 line-through">
          RRP: {price}
        </Paragraph1>
      </div>
    </Link>
  );
}
