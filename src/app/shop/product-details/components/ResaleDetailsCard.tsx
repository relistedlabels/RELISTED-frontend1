"use client";

import React, { useState, useEffect } from "react";
import { HiOutlineTag, HiOutlineHeart } from "react-icons/hi2";
import { Paragraph1 } from "@/common/ui/Text";
import { Heart } from "lucide-react";
import {
  useAddFavorite,
  useRemoveFavorite,
  useFavorites,
} from "@/lib/queries/renters/useFavorites";
import { useMe } from "@/lib/queries/auth/useMe";
import { usePublicProductById } from "@/lib/queries/product/usePublicProductById";
import { usePublicUserById } from "@/lib/queries/user/usePublicUserById";
import { DetailPanelSkeleton } from "@/common/ui/SkeletonLoaders";

interface UserProfileProps {
  name: string;
  rating: number;
  avatar?: string;
  userId: string;
}

const UserProfile: React.FC<UserProfileProps> = ({
  name,
  rating,
  avatar,
  userId,
}) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200  mt-4">
    <div className="flex items-center space-x-3">
      {/* Placeholder for User Image */}
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl text-gray-500">👤</span>
        )}
      </div>
      <div>
        <Paragraph1 className="text-sm font-semibold text-gray-900">
          {name.toUpperCase()}
        </Paragraph1>
        <div className="flex items-center  text-yellow-500">
          <span aria-label={`${rating} star rating`}>
            {"★".repeat(Math.floor(rating))}
            {"☆".repeat(5 - Math.floor(rating))}
          </span>
          <span className="text-gray-600 ml-1 text-[10px]">{rating}</span>
        </div>
      </div>
    </div>
    <a
      href={`/lister-profile/${userId}`}
      className=" font-semibold text-gray-900 hover:text-gray-700"
    >
      VIEW PROFILE
    </a>
  </div>
);

interface ResaleDetailsCardProps {
  productId: string;
}

const ResaleDetailsCard: React.FC<ResaleDetailsCardProps> = ({ productId }) => {
  const { data: product, isLoading } = usePublicProductById(productId);

  // Fetch lister/curator details
  const { data: lister } = usePublicUserById(product?.curatorId || "");

  // Favorite logic
  const { data: user } = useMe();
  const { data: favoritesData } = useFavorites(1, 100);
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (favoritesData?.favorites && product) {
      const isFav = favoritesData.favorites.some(
        (fav) => fav.productId === product.id,
      );
      setIsFavorited(isFav);
    }
  }, [favoritesData, product]);

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `/auth/sign-in?redirect=${currentUrl}`;
      return;
    }

    if (!product) return;

    if (isFavorited) {
      removeFavorite.mutate(product.id);
      setIsFavorited(false);
    } else {
      addFavorite.mutate(product.id);
      setIsFavorited(true);
    }
  };

  if (isLoading || !product) {
    return <DetailPanelSkeleton />;
  }

  // Use originalValue from product for resale price
  const resalePrice = product.originalValue;

  return (
    <div className="font-sans">
      <div className=" p-4 py-6 border border-gray-200 bg-[#FBFBFB] rounded-xl ">
        {/* Resale Value Section */}
        <div className="space-y-4 mb-6">
          {/* Resale Value */}
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 text-gray-700">
              <HiOutlineTag className="w-5 h-5" />
              <Paragraph1 className="text-sm font-medium">
                Resale Value
              </Paragraph1>
            </div>
            <Paragraph1 className="text-lg font-bold text-gray-900">
              ₦{resalePrice.toLocaleString()}
            </Paragraph1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 text-[14px] mb-4">
          <button
            className="flex-1 bg-black text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition duration-150"
            aria-label="Add to cart"
          >
            Add to Cart
          </button>
          <button
            onClick={handleFavoriteClick}
            disabled={addFavorite.isPending || removeFavorite.isPending}
            className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150 disabled:opacity-50 bg-white"
            aria-label={
              isFavorited ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              className="w-6 h-6"
              fill={isFavorited ? "red" : "none"}
              color={isFavorited ? "red" : "#222"}
            />
          </button>
        </div>

        {/* Security / Shipping Info */}
        <div className="p-3 bg-white border border-gray-200 rounded-lg flex items-start space-x-2 mb-4">
          <img src="/icons/safe1.svg" alt="secure" />
          <Paragraph1 className=" text-gray-700 leading-snug">
            Secure checkout. Item ships within 2-3 business days.
          </Paragraph1>
        </div>
      </div>

      {/* User Profile Card */}
      {lister && (
        <UserProfile
          name={lister.name || "Verified Lister"}
          rating={lister.rating || 4.5}
          avatar={lister.avatar}
          userId={product.curatorId}
        />
      )}
    </div>
  );
};

export default ResaleDetailsCard;
