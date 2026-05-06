"use client";

import React, { useState, useEffect } from "react";
import {
  HiOutlineBuildingStorefront,
  HiOutlineTag,
  HiOutlineHeart,
} from "react-icons/hi2";
import { TiTick } from "react-icons/ti";
import { Paragraph1 } from "@/common/ui/Text"; // Assuming custom text components based on previous context
import { Bell, Heart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useAddFavorite,
  useRemoveFavorite,
  useFavorites,
} from "@/lib/queries/renters/useFavorites";
import { useMe } from "@/lib/queries/auth/useMe";
import RentalPeriods from "./RentalPeriods";
import { usePublicProductById } from "@/lib/queries/product/usePublicProductById";
import { usePublicUserById } from "@/lib/queries/user/usePublicUserById";
import { DetailPanelSkeleton } from "@/common/ui/SkeletonLoaders";
import { isInhouseManager } from "@/lib/inhouseManager";
import { toast } from "sonner";
import { useSubscribeProductNotifyWhenAvailable } from "@/lib/mutations/renters/useSubscribeProductNotifyWhenAvailable";

// ============================================================================
// API ENDPOINTS USED:
// ============================================================================
// GET /api/public/products/:productId - Fetch product details including pricing
//   Returns: Daily rental price, security deposit, delivery fees, cleaning fees
//
// GET /api/renters/verifications/status - Check if user can place rental requests
//   Ensures renter has verified ID before allowing rental requests
// ============================================================================

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
          {name.toUpperCase()}{" "}
          {isInhouseManager(userId) && (
            <span className=" text-gray-500">- Managed by Relisted</span>
          )}
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

interface RentalDetailsCardProps {
  productId: string;
}

const RentalDetailsCard: React.FC<RentalDetailsCardProps> = ({ productId }) => {
  const { data: product, isLoading } = usePublicProductById(productId);

  // Fetch lister/curator details
  const { data: lister } = usePublicUserById(product?.curatorId || "");

  // Favorite logic (copied from ProductCard)
  const { data: user } = useMe();
  const { data: favoritesData } = useFavorites(1, 100);
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showNotifyMe, setShowNotifyMe] = useState(false);
  const [notifySignedUp, setNotifySignedUp] = useState(false);
  const subscribeNotify = useSubscribeProductNotifyWhenAvailable();

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
      // Capture current page URL
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

  const handleNotifyWhenAvailable = async () => {
    if (!user) {
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `/auth/sign-in?redirect=${currentUrl}`;
      return;
    }
    if (!product) return;
    try {
      const res = await subscribeNotify.mutateAsync(product.id);
      toast.success(res.message);
      setNotifySignedUp(true);
      setShowNotifyMe(true);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Could not sign up for notifications.";
      toast.error(msg);
    }
  };

  if (isLoading || !product) {
    return <DetailPanelSkeleton />;
  }

  // Use collateralPrice from product (API now provides this)
  const collateralPrice = product.collateralPrice;
  const soldOut = product.status === "SOLD";
  const rentedOut = product.status === "RENTED";

  return (
    <div className="font-sans">
      <div className=" p-4 py-6 border border-gray-200 bg-[#FBFBFB] rounded-xl ">
        {/* Rental and Item Value Section */}
        <div className="space-y-4 mb-6">
          {/* Rental Fee */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-700">
              <HiOutlineBuildingStorefront className="w-5 h-5" />
              <Paragraph1 className="text-sm">Daily Rental</Paragraph1>
            </div>
            <Paragraph1 className="text-lg font-bold text-gray-900">
              ₦{product.dailyPrice.toLocaleString()}
            </Paragraph1>
          </div>

          {/* Item Value */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-700">
              <HiOutlineTag className="w-5 h-5" />
              <Paragraph1 className="text-sm">Security Deposit:</Paragraph1>
            </div>
            <div className="flex items-center space-x-2">
              <Paragraph1 className="text-sm text-gray-500">
                (Refundable)
              </Paragraph1>
              <Paragraph1 className="text-lg font-bold text-gray-900">
                ₦{collateralPrice.toLocaleString()}
              </Paragraph1>
            </div>
          </div>
        </div>

        {/* Rental Duration Selection */}
        <div className="mb-6">
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            Rental Duration
          </Paragraph1>
          {soldOut ? (
            <div className="flex gap-2 mb-4">
              <Paragraph1 className="flex-1 text-sm text-gray-600 py-4 px-3 bg-gray-50 rounded-lg border border-gray-200 leading-relaxed">
                This listing is sold out and is no longer available to rent.
              </Paragraph1>
              <button
                type="button"
                onClick={handleFavoriteClick}
                disabled={addFavorite.isPending || removeFavorite.isPending}
                className="self-start p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150 disabled:opacity-50 bg-white shrink-0"
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
          ) : rentedOut ? (
            <div className="mb-4 space-y-3">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
                <Paragraph1 className="text-sm font-semibold text-amber-950">
                  Currently out on rental
                </Paragraph1>
                <Paragraph1 className="text-sm text-amber-900/90 mt-1 leading-relaxed">
                  You can&apos;t book new dates until the item is returned. Tap
                  below to hear when it&apos;s available again.
                </Paragraph1>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (notifySignedUp) {
                        setShowNotifyMe((v) => !v);
                        return;
                      }
                      void handleNotifyWhenAvailable();
                    }}
                    disabled={subscribeNotify.isPending}
                    className="flex w-full justify-center items-center gap-2 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-3 border-2 border-gray-800 rounded-lg font-semibold text-gray-800 transition duration-150"
                  >
                    <Bell className="w-5 h-5 shrink-0" />
                    {notifySignedUp
                      ? "You're on the list"
                      : subscribeNotify.isPending
                        ? "Saving…"
                        : "Notify Me When Available"}
                  </button>
                  <AnimatePresence>
                    {showNotifyMe && notifySignedUp && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="rounded-lg border border-blue-200 bg-blue-50 p-3"
                      >
                        <Paragraph1 className="text-blue-900 text-sm leading-relaxed">
                          We&apos;ll email your Relisted account when this item
                          is back and available to rent.
                        </Paragraph1>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  type="button"
                  onClick={handleFavoriteClick}
                  disabled={addFavorite.isPending || removeFavorite.isPending}
                  className="self-start p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150 disabled:opacity-50 bg-white shrink-0"
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
            </div>
          ) : (
            <div className="flex space-x-2 mb-4">
              <RentalPeriods
                productId={product.id}
                listerId={product.curatorId}
                dailyPrice={product.dailyPrice}
                collateralPrice={collateralPrice}
                listingType={product.listingType}
                resalePrice={product.resalePrice}
              />
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
          )}
        </div>

        {/* Action Buttons */}

        {/* Security / Deposit Info */}
        <div className="p-3 bg-white border border-gray-200 rounded-lg flex items-start space-x-2 mb-4">
          {/* <TiTick className="w-5 h-5 text-green-600 mt-0.5 shrink-0" /> */}
          <img src="/icons/safe1.svg" alt="safe" />
          <Paragraph1 className=" text-gray-700 leading-snug">
            Your deposit is secure and fully refunded after item return and
            approval.
          </Paragraph1>
        </div>

        {/* Cleaning Fees Note */}
        <Paragraph1 className=" text-center text-gray-500 mt-2 pb-2">
          Delivery and cleaning fees calculated at checkout
        </Paragraph1>
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

export default RentalDetailsCard;
