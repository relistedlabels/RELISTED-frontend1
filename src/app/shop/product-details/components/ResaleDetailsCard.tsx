"use client";

import React, { useEffect, useMemo, useState } from "react";
import { HiOutlineTag } from "react-icons/hi2";
import { Paragraph1 } from "@/common/ui/Text";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  useAddFavorite,
  useRemoveFavorite,
  useFavorites,
} from "@/lib/queries/renters/useFavorites";
import { useAddCartItem } from "@/lib/mutations/renters/useAddCartItem";
import { useSubmitRentalRequest } from "@/lib/mutations/renters/useRentalRequestMutations";
import { useMe } from "@/lib/queries/auth/useMe";
import { usePublicProductById } from "@/lib/queries/product/usePublicProductById";
import { usePublicUserById } from "@/lib/queries/user/usePublicUserById";
import { getCartItemsApi } from "@/lib/api/cart";
import {
  submitGuestAvailabilityCheck,
  type GuestAvailabilitySubmitResponse,
} from "@/lib/api/publicAvailability";
import { DetailPanelSkeleton } from "@/common/ui/SkeletonLoaders";
import GuestContactModal from "./GuestContactModal";
import { usePublicSiteFeatures } from "@/lib/queries/site/useSiteFeatures";
import {
  publicProductHasCloset,
} from "@/lib/vaultClosetSaleDates";
import { getProductPreSaleCta } from "@/lib/shopSale/productSale";
import { cloudinaryOptimizedImageUrl } from "@/lib/media/cloudinaryOptimizedImageUrl";

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
      <div className="flex justify-center items-center bg-gray-200 rounded-full w-10 h-10 overflow-hidden">
        {avatar ? (
          <img
            src={cloudinaryOptimizedImageUrl(avatar, { preset: "thumb" })}
            alt={name}
            className="w-full h-full object-cover"
          />
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

function cartLineIdFromAddCartPayload(payload: unknown): string | undefined {
  const walk = (v: unknown): string | undefined => {
    if (v == null || typeof v !== "object") return undefined;
    const o = v as Record<string, unknown>;
    for (const k of ["id", "cartItemId", "cart_item_id"] as const) {
      const s = o[k];
      if (typeof s === "string" && s.trim()) return s.trim();
    }
    for (const nested of [o.data, o.item, o.cartItem]) {
      const found = walk(nested);
      if (found) return found;
    }
    return undefined;
  };
  return walk(payload);
}

interface ResaleDetailsCardProps {
  productId: string;
}

const ResaleDetailsCard: React.FC<ResaleDetailsCardProps> = ({ productId }) => {
  const router = useRouter();
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

  const { data: user } = useMe();
  const { data: favoritesData } = useFavorites(1, 100);
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const addToCart = useAddCartItem();
  const submitRentalRequest = useSubmitRentalRequest();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  useEffect(() => {
    if (favoritesData?.favorites && product) {
      const isFav = favoritesData.favorites.some(
        (fav) => fav.productId === product.id,
      );
      setIsFavorited(isFav);
    }
  }, [favoritesData, product]);

  const resalePrice = product?.resalePrice ?? product?.originalValue ?? 0;

  const redirectAfterAvailabilitySubmit = (
    res: GuestAvailabilitySubmitResponse,
  ) => {
    const checkingUrl = res?.data?.checkingUrl;
    const requestId = res?.data?.requestId;
    const accessToken = res?.data?.accessToken;
    if (checkingUrl) {
      router.push(checkingUrl);
      return;
    }
    if (requestId && accessToken) {
      router.push(
        `/shop/availability/checking?requestId=${requestId}&token=${accessToken}`,
      );
      return;
    }
    if (requestId) {
      router.push(`/shop/availability/checking?requestId=${requestId}`);
    }
  };

  const submitPurchaseAvailability = async (guestContact?: {
    firstName: string;
    email: string;
  }) => {
    if (!product || product.status === "SOLD") {
      toast.error("This item has been sold.");
      return;
    }

    setIsRequesting(true);
    try {
      if (!user && guestContact) {
        const res = await submitGuestAvailabilityCheck({
          productId: product.id,
          listerId: product.curatorId,
          firstName: guestContact.firstName,
          email: guestContact.email,
          rentalDays: 0,
          rentalStartDate: null,
          rentalEndDate: null,
          estimatedRentalPrice: resalePrice,
        });
        toast.success("We are checking availability with the lister.");
        redirectAfterAvailabilitySubmit(res);
        return;
      }

      if (!user) {
        setIsGuestModalOpen(true);
        return;
      }

      let cartItemId: string | undefined;
      try {
        const addRes = await addToCart.mutateAsync({
          productId: product.id,
          days: 0,
        });
        cartItemId = cartLineIdFromAddCartPayload(addRes?.data ?? addRes);
      } catch (cartErr: unknown) {
        const msg = String(
          cartErr && typeof cartErr === "object" && "message" in cartErr
            ? (cartErr as { message: string }).message
            : "",
        );
        if (/already in cart/i.test(msg)) {
          try {
            const cart = await getCartItemsApi();
            const line = [...(cart.items ?? [])]
              .reverse()
              .find((i) => i.productId === product.id);
            cartItemId = line?.id;
          } catch {}
        } else {
          toast.error(msg || "Could not add to cart.");
          return;
        }
      }

      const res = await submitRentalRequest.mutateAsync({
        productId: product.id,
        listerId: product.curatorId,
        rentalStartDate: null,
        rentalEndDate: null,
        rentalDays: 0,
        estimatedRentalPrice: resalePrice,
        autoPay: false,
        currency: "NGN",
        ...(cartItemId ? { cartItemId } : {}),
      });

      if (res?.success && res?.data) {
        toast.success("We are checking availability with the lister.");
        redirectAfterAvailabilitySubmit(res);
      }
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Could not submit request. Please try again.";
      if (/already.*request|already.*pending|pending.*request/i.test(msg)) {
        toast.info("You already have a pending request for this item.");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCheckAvailability = () => {
    void submitPurchaseAvailability();
  };

  const handleGuestContactSubmit = (contact: {
    firstName: string;
    email: string;
  }) => {
    setIsGuestModalOpen(false);
    void submitPurchaseAvailability(contact);
  };

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

  const soldOut = product.status === "SOLD";

  return (
    <div className="">
      <div className="bg-[#FBFBFB] p-4 py-6 border border-gray-200 rounded-xl">
        <div className="space-y-4 mb-6">
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
          ) : (
            <>
              <button
                type="button"
                onClick={handleCheckAvailability}
                disabled={isRequesting}
                className={`flex flex-1 min-w-0 cursor-pointer items-center justify-center gap-1 rounded-lg border border-black bg-black text-center font-semibold text-white transition hover:bg-gray-100 hover:text-black disabled:opacity-50 ${
                  closetPrimaryCtaOverride
                    ? "px-2 py-2.5 sm:px-3"
                    : "px-4 py-2 text-sm"
                }`}
              >
                {isRequesting ? (
                  <>
                    <Loader2 className="inline w-4 h-4 animate-spin shrink-0" />
                    <Paragraph1 className="m-0 text-inherit text-center">
                      Checking…
                    </Paragraph1>
                  </>
                ) : closetPrimaryCtaOverride ? (
                  <Paragraph1 className="m-0 max-w-full text-[11px] text-inherit sm:text-xs text-center leading-snug">
                    {closetPrimaryCtaOverride}
                  </Paragraph1>
                ) : (
                  <Paragraph1 className="m-0 text-white text-sm text-center">
                    Check availability
                  </Paragraph1>
                )}
              </button>
              <button
                type="button"
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

        <div className="flex items-start gap-2.5 pt-1">
          <img
            src="/icons/safe1.svg"
            alt=""
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-hidden
          />
          <Paragraph1 className="text-xs leading-relaxed text-gray-500">
            No payment yet. Address and payment at checkout once availability is
            confirmed.
          </Paragraph1>
        </div>
      </div>

      {lister && (
        <UserProfile
          name={lister.name || "Verified Lister"}
          rating={lister.rating || 4.5}
          avatar={lister.avatar}
          userId={product.curatorId}
        />
      )}

      <GuestContactModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onSubmit={handleGuestContactSubmit}
        isSubmitting={isRequesting}
      />
    </div>
  );
};

export default ResaleDetailsCard;
