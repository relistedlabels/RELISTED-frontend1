"use client";

import React, { useState, useEffect } from "react";
import { HiOutlineTag, HiOutlineHeart } from "react-icons/hi2";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  useAddFavorite,
  useRemoveFavorite,
  useFavorites,
} from "@/lib/queries/renters/useFavorites";
import { useAddCartItem } from "@/lib/mutations/renters/useAddCartItem";
import { useSubmitRentalRequest } from "@/lib/mutations/renters/useRentalRequestMutations";
import { useMe } from "@/lib/queries/auth/useMe";
import { useUserStore } from "@/store/useUserStore";
import { usePublicProductById } from "@/lib/queries/product/usePublicProductById";
import { usePublicUserById } from "@/lib/queries/user/usePublicUserById";
import { useProfileDetails } from "@/lib/queries/renters/useProfileDetails";
import { useAddresses } from "@/lib/queries/renters/useAddresses";
import { getCartItemsApi } from "@/lib/api/cart";
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
  const router = useRouter();
  const pathname = usePathname();
  const setUser = useUserStore((s) => s.setUser);
  const { data: product, isLoading } = usePublicProductById(productId);

  // Fetch lister/curator details
  const { data: lister } = usePublicUserById(product?.curatorId || "");

  // Favorite logic
  const { data: user } = useMe();
  const { data: favoritesData } = useFavorites(1, 100);
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const addToCart = useAddCartItem();
  const submitRentalRequest = useSubmitRentalRequest();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isProfileSetupModalOpen, setIsProfileSetupModalOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Profile and addresses for availability request
  const { data: profileData, isLoading: isProfileLoading } =
    useProfileDetails();
  const { data: addressesData, isLoading: isAddressesLoading } = useAddresses();

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

  const handleBuy = async () => {
    if (!user) {
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `/auth/sign-in?redirect=${currentUrl}`;
      return;
    }

    if (!product) return;

    if (isProfileLoading || isAddressesLoading) {
      toast.info("Loading your profile and addresses...");
      return;
    }

    if (!profileData) {
      setIsProfileSetupModalOpen(true);
      return;
    }

    const defaultAddress = addressesData?.[0];
    if (!defaultAddress) {
      setIsProfileSetupModalOpen(true);
      return;
    }

    setIsRequesting(true);

    try {
      // Add to cart first with days = 0 for resale
      let cartItemId: string | undefined;
      try {
        const addRes = await addToCart.mutateAsync({
          productId: product.id,
          days: 0,
        });
        cartItemId = addRes?.data?.id;
      } catch (cartErr: any) {
        const msg = String(cartErr?.message ?? "");
        const alreadyInCart = /already in cart/i.test(msg);
        if (alreadyInCart) {
          try {
            const cart = await getCartItemsApi();
            const line = [...(cart.items ?? [])]
              .reverse()
              .find((i) => i.productId === product.id);
            cartItemId = line?.id;
          } catch {}
        } else {
          console.error("❌ Error posting cart item:", cartErr);
          toast.error(msg || "Could not add to cart.");
          setIsRequesting(false);
          return;
        }
      }

      // Submit availability request with null dates for resale
      await submitRentalRequest.mutateAsync({
        productId: product.id,
        listerId: product.curatorId,
        rentalStartDate: null,
        rentalEndDate: null,
        rentalDays: 0,
        estimatedRentalPrice: resalePrice,
        deliveryAddressId: defaultAddress.id,
        autoPay: false,
        currency: "NGN",
        ...(cartItemId ? { cartItemId } : {}),
      });

      toast.success("Request sent! Awaiting lister approval.");
      setAddedToCart(true);
    } catch (e: any) {
      console.error("❌ Error in handleBuy:", e);
      const msg = String(e?.message ?? "");
      if (/already.*request|already.*pending|pending.*request/i.test(msg)) {
        toast.info("You already have a pending request for this item.");
      } else {
        toast.error(msg || "Could not submit request. Please try again.");
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleProfileSetupProceed = () => {
    setUser({ role: "RENTER" });
    const returnUrl = encodeURIComponent(pathname);
    router.push(`/auth/profile-setup?returnUrl=${returnUrl}`);
  };

  if (isLoading || !product) {
    return <DetailPanelSkeleton />;
  }

  // Use resalePrice from product, fallback to originalValue if not available
  const resalePrice = product.resalePrice ?? product.originalValue;

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
          {addedToCart ? (
            <button
              type="button"
              onClick={() => router.push("/shop/cart")}
              className="flex-1 bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 transition duration-150"
            >
              View Cart
            </button>
          ) : (
            <button
              type="button"
              onClick={handleBuy}
              disabled={isRequesting}
              className="flex-1 bg-black text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition duration-150 disabled:opacity-50"
            >
              {isRequesting ? (
                <>
                  <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Add to Cart"
              )}
            </button>
          )}
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

      {/* Profile Setup Required Modal */}
      <AnimatePresence>
        {isProfileSetupModalOpen && (
          <motion.div
            className="z-[101] fixed inset-0 flex justify-center items-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white shadow-xl p-8 rounded-2xl w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="flex justify-center items-center bg-blue-100 rounded-full w-16 h-16">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <Paragraph2 className="mb-2 font-bold text-gray-900 text-2xl text-center">
                Complete Your Profile
              </Paragraph2>

              {/* Description */}
              <Paragraph1 className="mb-6 text-gray-600 text-center leading-relaxed">
                To complete this action, you need to set up your profile and add
                a delivery address first. This will only take a few minutes!
              </Paragraph1>

              {/* Modal Actions */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleProfileSetupProceed}
                  className="bg-black hover:bg-gray-800 px-4 py-3 rounded-lg w-full font-semibold text-white text-sm transition-colors"
                >
                  Proceed to Setup
                </button>
                <button
                  type="button"
                  onClick={() => setIsProfileSetupModalOpen(false)}
                  className="hover:bg-gray-50 px-4 py-3 border border-gray-300 rounded-lg w-full font-semibold text-gray-900 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResaleDetailsCard;
