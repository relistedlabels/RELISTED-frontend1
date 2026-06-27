"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import DispatchWindowsScheduler from "@/app/shop/cart/checkout/components/DispatchWindowsScheduler";
import type {
  DispatchWindowContext,
  DispatchWindowSelection,
  DispatchWindowSelectionMap,
  DispatchWindowsPayload,
  ShipmentDispatchType,
} from "@/lib/checkout/dispatchWindows";
import { buildDispatchWindowContexts } from "@/lib/checkout/dispatchWindows";
import { usePublicSiteFeatures } from "@/lib/queries/site/useSiteFeatures";
import {
  closetDispatchAnchorDate,
  getClosetEarliestDeliveryLagosYmd,
  lagosYmdMax,
  publicProductHasCloset,
} from "@/lib/vaultClosetSaleDates";
import { getProductPreSaleCta } from "@/lib/shopSale/productSale";
import { getTodayInLagos } from "@/lib/checkout/dispatchWindows";

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
  <div className="flex justify-between items-center bg-white mt-4 p-4 border border-gray-200 rounded-xl">
    <div className="flex items-center space-x-3">
      {/* Placeholder for User Image */}
      <div className="flex justify-center items-center bg-gray-200 rounded-full w-10 h-10 overflow-hidden">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-500 text-xl">👤</span>
        )}
      </div>
      <div>
        <Paragraph1 className="font-semibold text-gray-900 text-sm">
          {name.toUpperCase()}
        </Paragraph1>
        <div className="flex items-center text-yellow-500">
          <span aria-label={`${rating} star rating`}>
            {"★".repeat(Math.floor(rating))}
            {"☆".repeat(5 - Math.floor(rating))}
          </span>
          <span className="ml-1 text-[10px] text-gray-600">{rating}</span>
        </div>
      </div>
    </div>
    <a
      href={`/lister-profile/${userId}`}
      className="font-semibold text-gray-900 hover:text-gray-700"
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
  const { data: siteFeaturesRes } = usePublicSiteFeatures();
  const closetShopNavEnabled =
    siteFeaturesRes?.data?.headerClosetsShopNavEnabled !== false;
  const closetPrimaryCtaOverride = useMemo(
    () =>
      product &&
      (!closetShopNavEnabled || product.activeSale) &&
      (publicProductHasCloset(product) || product.activeSale)
        ? getProductPreSaleCta(product, { legacyClosetFallback: true })
        : undefined,
    [closetShopNavEnabled, product],
  );
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
  const [dispatchSelections, setDispatchSelections] =
    useState<DispatchWindowSelectionMap>({});

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

  const isClosetProduct = Boolean(product && publicProductHasCloset(product));

  const dispatchContexts = useMemo<DispatchWindowContext[]>(() => {
    if (!product) return [];
    const minDate = isClosetProduct
      ? lagosYmdMax(getTodayInLagos(), getClosetEarliestDeliveryLagosYmd())
      : undefined;
    return buildDispatchWindowContexts([
      {
        type: "RESALE",
        baseDate: isClosetProduct ? closetDispatchAnchorDate() : new Date(),
        minDate,
        allowDateChange: true,
        allowRollForward: true,
        baseDateReason: isClosetProduct
          ? "Earliest delivery is Monday 18 May"
          : undefined,
      },
    ]);
  }, [product, isClosetProduct]);

  useEffect(() => {
    if (dispatchContexts.length === 0) {
      setDispatchSelections({});
      return;
    }
    setDispatchSelections((prev) => {
      const next = { ...prev } as DispatchWindowSelectionMap;
      let changed = false;

      dispatchContexts.forEach((ctx) => {
        if (!next[ctx.type]) {
          next[ctx.type] = {
            type: ctx.type,
            window: ctx.suggested.window,
            mode: "DEFAULT",
            baseDate: ctx.suggested.baseDate,
            scheduledDate: ctx.suggested.scheduledDate,
            rolledForwardDays: ctx.suggested.rolledForwardDays,
          } satisfies DispatchWindowSelection;
          changed = true;
        }
      });

      (Object.keys(next) as ShipmentDispatchType[]).forEach((type) => {
        if (!dispatchContexts.some((ctx) => ctx.type === type)) {
          delete next[type];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [dispatchContexts]);

  const handleDispatchSelectionChange = useCallback(
    (
      type: ShipmentDispatchType,
      selection: DispatchWindowSelection | undefined,
    ) => {
      setDispatchSelections((prev) => {
        const next = { ...prev } as DispatchWindowSelectionMap;
        if (!selection) {
          delete next[type];
        } else {
          next[type] = selection;
        }
        return next;
      });
    },
    [],
  );

  const dispatchWindowsPayload = useMemo<
    DispatchWindowsPayload | undefined
  >(() => {
    if (dispatchContexts.length === 0) {
      return undefined;
    }
    const payload: DispatchWindowsPayload = {};
    dispatchContexts.forEach((ctx) => {
      const selection = dispatchSelections[ctx.type];
      if (selection?.window) {
        payload[ctx.type] = selection.window;
      }
    });
    return Object.keys(payload).length > 0 ? payload : undefined;
  }, [dispatchContexts, dispatchSelections]);

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
    if (product?.status === "SOLD") {
      toast.error("This item has been sold.");
      return;
    }

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

    if (dispatchContexts.length > 0 && !dispatchWindowsPayload) {
      toast.error("Please confirm delivery options before proceeding.");
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
        ...(dispatchWindowsPayload
          ? { dispatchWindows: dispatchWindowsPayload }
          : {}),
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
  const soldOut = product.status === "SOLD";

  return (
    <div className="">
      <div className="bg-[#FBFBFB] p-4 py-6 border border-gray-200 rounded-xl">
        {/* Resale Value Section */}
        <div className="space-y-4 mb-6">
          {/* Resale Value */}
          <div className="flex justify-between items-center bg-white p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 text-gray-700">
              <HiOutlineTag className="w-5 h-5" />
              <Paragraph1 className="font-medium text-sm">
                Resale Value
              </Paragraph1>
            </div>
            <Paragraph1 className="font-bold text-gray-900 text-lg">
              ₦{resalePrice.toLocaleString()}
            </Paragraph1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-4">
          {soldOut ? (
            <div className="flex gap-2 w-full">
              <button
                type="button"
                disabled
                className="flex-1 bg-gray-200 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-500 text-center cursor-not-allowed"
              >
                Sold out
              </button>
              <button
                type="button"
                onClick={handleFavoriteClick}
                disabled={addFavorite.isPending || removeFavorite.isPending}
                className="bg-white hover:bg-gray-50 disabled:opacity-50 p-3 border border-gray-300 rounded-lg transition duration-150 shrink-0"
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
          ) : addedToCart ? (
            <div className="flex gap-2 w-full">
              <Link
                href="/shop/cart"
                className="flex flex-1 justify-center items-center bg-black hover:bg-gray-800 px-4 py-3 rounded-lg font-semibold text-white text-center transition duration-150"
              >
                View cart
              </Link>
              <button
                type="button"
                onClick={handleFavoriteClick}
                disabled={addFavorite.isPending || removeFavorite.isPending}
                className="bg-white hover:bg-gray-50 disabled:opacity-50 p-3 border border-gray-300 rounded-lg transition duration-150 shrink-0"
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
          ) : (
            <>
              <button
                type="button"
                onClick={handleBuy}
                disabled={isRequesting}
                className={`flex flex-1 min-w-0 cursor-pointer items-center justify-center gap-1 rounded-lg border border-black bg-black text-center font-semibold text-white transition hover:bg-gray-100 hover:text-black disabled:opacity-50 ${
                  closetPrimaryCtaOverride
                    ? "px-2 py-2.5 sm:px-3"
                    : "px-4 py-2 text-sm"
                }`}
              >
                {isRequesting ? (
                  <>
                    <Loader2 className="inline h-4 w-4 shrink-0 animate-spin" />
                    <Paragraph1 className="m-0 text-center text-inherit">
                      Processing...
                    </Paragraph1>
                  </>
                ) : closetPrimaryCtaOverride ? (
                  <Paragraph1 className="m-0 max-w-full text-center text-[11px] leading-snug text-inherit sm:text-xs">
                    {closetPrimaryCtaOverride}
                  </Paragraph1>
                ) : (
                  <Paragraph1 className="m-0 text-center text-sm text-white">
                    Add to Cart
                  </Paragraph1>
                )}
              </button>
              <button
                onClick={handleFavoriteClick}
                disabled={addFavorite.isPending || removeFavorite.isPending}
                className="bg-white hover:bg-gray-50 disabled:opacity-50 p-3 border border-gray-300 rounded-lg transition duration-150"
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
            </>
          )}
        </div>

        {!soldOut && !addedToCart && dispatchContexts.length > 0 && (
          <div className="space-y-3 mb-6">
            <Paragraph1 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
              Delivery options
            </Paragraph1>
            <Paragraph1 className="text-gray-600 text-xs">
              Choose when to receive this purchase so our courier can lock in
              the right slot.
            </Paragraph1>
            <DispatchWindowsScheduler
              contexts={dispatchContexts}
              selections={dispatchSelections}
              onSelectionChange={handleDispatchSelectionChange}
            />
          </div>
        )}

        {/* Security / Shipping Info */}
        <div className="flex items-center space-x-2 bg-white mb-4 p-3 border border-gray-200 rounded-lg">
          <img src="/icons/safe1.svg" alt="secure" />
          <Paragraph1 className="text-gray-700 leading-snug">
            Secure checkout. Item ships within 1-3 business days.
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
