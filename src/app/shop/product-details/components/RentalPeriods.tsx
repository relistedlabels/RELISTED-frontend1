"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { DispatchWindowsPayload } from "@/lib/checkout/dispatchWindows";
import { toast } from "sonner";
import { X, ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { buttonPrimary, buttonSecondary } from "@/common/ui/buttonClasses";
import {
  slidePanelBackdrop,
  slidePanelBody,
  slidePanelFooter,
  slidePanelHeader,
  slidePanelSheetPinned,
  slidePanelTitle,
} from "@/common/ui/dashboardClasses";
import { Paragraph1 } from "@/common/ui/Text";
import RentalDurationSelector from "./RentalDurationSelector";
import RentalDispatchWindowPicker, {
  rentalDispatchCalendarStartYmd,
} from "./RentalDispatchWindowPicker";
import { useSubmitRentalRequest } from "@/lib/mutations/renters/useRentalRequestMutations";
import GuestContactModal from "./GuestContactModal";
import {
  submitGuestAvailabilityCheck,
  type GuestAvailabilitySubmitResponse,
} from "@/lib/api/publicAvailability";
import { useAddCartItem } from "@/lib/mutations/renters/useAddCartItem";
import { useMe } from "@/lib/queries/auth/useMe";
import { getCartItemsApi } from "@/lib/api/cart";
import {
  addCalendarDaysLocal,
  formatDateOnlyLocal,
} from "@/lib/dates/formatDateOnlyLocal";
import { usePublicProductById } from "@/lib/queries/product/usePublicProductById";
import {
  getClosetEarliestDeliveryLagosYmd,
  publicProductHasCloset,
} from "@/lib/vaultClosetSaleDates";
import {
  getProductSaleEarliestDeliveryLagosYmd,
  productHasActiveSale,
} from "@/lib/shopSale/productSale";
import { useUrlOverlay } from "@/hooks/useUrlOverlay";

/** URL flag while the rental dates panel is open (`?select-dates=1`). */
export const RENTAL_DATES_OVERLAY_PARAM = "select-dates";

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

// Hook to get renter profile (uses GET /api/renters/profile)
// Hook to get renter addresses (uses GET /api/renters/profile/addresses)

interface RentalPeriodsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  listerId: string;
  dailyPrice: number;
  collateralPrice: number;
  listingType?: "RENTAL" | "RESALE" | "RENT_OR_RESALE";
  resalePrice?: number | null;
}

const RentalPeriodsPanel: React.FC<RentalPeriodsPanelProps> = ({
  isOpen,
  onClose,
  productId,
  listerId,
  dailyPrice,
  collateralPrice,
  listingType,
  resalePrice,
}) => {
  const { data: user } = useMe();
  const router = useRouter();
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [pendingGuestSubmit, setPendingGuestSubmit] = useState(false);
  const [dispatchWindowsPayload, setDispatchWindowsPayload] = useState<
    DispatchWindowsPayload | undefined
  >(undefined);

  const [mounted, setMounted] = useState(false);

  const variants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  const [rentalDays, setRentalDays] = useState(1);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [isChecking, setIsChecking] = useState(false);
  const submitRentalRequest = useSubmitRentalRequest();
  const { data: closetProduct } = usePublicProductById(productId);
  const isClosetProduct = Boolean(
    closetProduct && publicProductHasCloset(closetProduct),
  );
  const isSaleProduct = productHasActiveSale(closetProduct);
  const closetEarliestDeliveryYmd = useMemo(() => {
    const saleYmd = getProductSaleEarliestDeliveryLagosYmd(closetProduct);
    if (saleYmd) return saleYmd;
    if (isClosetProduct || isSaleProduct) {
      return getClosetEarliestDeliveryLagosYmd();
    }
    return undefined;
  }, [closetProduct, isClosetProduct, isSaleProduct]);
  const applyDeliveryFloor = Boolean(closetEarliestDeliveryYmd);

  const addCartItem = useAddCartItem();

  const suggestedRentalCalendarStartYmd = useMemo(
    () =>
      rentalDispatchCalendarStartYmd(
        applyDeliveryFloor,
        closetEarliestDeliveryYmd,
      ),
    [applyDeliveryFloor, closetEarliestDeliveryYmd],
  );

  const supportsRentalDates = listingType !== "RESALE";

  const handleRentalDaysChange = useCallback((days: number, start?: Date) => {
    setRentalDays(days);
    if (start) setStartDate(start);
  }, []);

  const buildAvailabilityPayload = () => {
    const isResale =
      listingType === "RESALE" ||
      (listingType === "RENT_OR_RESALE" && rentalDays === 0);
    const rentalStartDate = isResale ? null : formatDateOnlyLocal(startDate);
    const endDayOffset = isResale ? 0 : Math.max(0, rentalDays - 1);
    const rentalEndDate = isResale
      ? null
      : formatDateOnlyLocal(addCalendarDaysLocal(startDate, endDayOffset));
    const estimatedRentalPrice = isResale
      ? (resalePrice ?? 0)
      : dailyPrice * rentalDays;
    return {
      isResale,
      rentalStartDate,
      rentalEndDate,
      estimatedRentalPrice,
    };
  };

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

  const submitAvailabilityRequest = async (guestContact?: {
    firstName: string;
    email: string;
    whatsappPhone?: string;
  }) => {
    if (!Number.isFinite(startDate.getTime())) {
      toast.error("Invalid rental start date.");
      return;
    }

    const { isResale, rentalStartDate, rentalEndDate, estimatedRentalPrice } =
      buildAvailabilityPayload();

    if (!isResale && rentalDays > 0 && !dispatchWindowsPayload) {
      toast.error("Pick delivery and return times so the lister can confirm.");
      return;
    }

    setIsChecking(true);
    try {
      if (!user && guestContact) {
        const res = await submitGuestAvailabilityCheck({
          productId,
          listerId,
          firstName: guestContact.firstName,
          email: guestContact.email,
          ...(guestContact.whatsappPhone
            ? { whatsappPhone: guestContact.whatsappPhone }
            : {}),
          rentalDays,
          rentalStartDate: rentalStartDate ?? "",
          rentalEndDate: rentalEndDate ?? "",
          estimatedRentalPrice,
          ...(dispatchWindowsPayload
            ? { dispatchWindows: dispatchWindowsPayload }
            : {}),
        });
        toast.success("We are checking availability with the lister.");
        onClose();
        redirectAfterAvailabilitySubmit(res);
        return;
      }

      if (!user) {
        setIsGuestModalOpen(true);
        return;
      }

      let cartItemId: string | undefined;
      try {
        const addRes = await addCartItem.mutateAsync({
          productId,
          days: rentalDays,
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
              .find((i) => i.productId === productId);
            cartItemId = line?.id;
          } catch {}
        } else {
          toast.error(msg || "Could not add to cart.");
          return;
        }
      }

      const res = await submitRentalRequest.mutateAsync({
        productId,
        listerId,
        rentalStartDate,
        rentalEndDate,
        rentalDays,
        estimatedRentalPrice,
        autoPay: false,
        currency: "NGN",
        ...(cartItemId ? { cartItemId } : {}),
        ...(dispatchWindowsPayload
          ? { dispatchWindows: dispatchWindowsPayload }
          : {}),
      });

      if (res?.success && res?.data) {
        toast.success("We are checking availability with the lister.");
        onClose();
        redirectAfterAvailabilitySubmit(res);
      }
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Could not submit request. Please try again.";
      toast.error(msg);
    } finally {
      setIsChecking(false);
      setPendingGuestSubmit(false);
    }
  };

  const handleCheckAvailability = () => {
    void submitAvailabilityRequest();
  };

  const handleGuestContactSubmit = (contact: {
    firstName: string;
    email: string;
    whatsappPhone?: string;
  }) => {
    setIsGuestModalOpen(false);
    setPendingGuestSubmit(true);
    void submitAvailabilityRequest(contact);
  };

  const panel = (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className={slidePanelBackdrop}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={slidePanelSheetPinned}
            role="dialog"
            aria-modal="true"
            aria-label="Product RentalPeriods"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={slidePanelHeader}>
              <button
                onClick={onClose}
                className="xl:hidden p-1 rounded-full text-gray-500 hover:text-black transition"
                aria-label="Close RentalPeriods"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className={slidePanelTitle}>SELECT YOUR DATES</Paragraph1>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-500 hover:text-black transition"
                aria-label="Close RentalPeriods"
              >
                <X className="hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className={`${slidePanelBody} space-y-5 pt-3 sm:space-y-6`}>
              <RentalDurationSelector
                productId={productId}
                listerId={listerId}
                dailyPrice={dailyPrice}
                collateralPrice={collateralPrice}
                onChangeRentalDays={handleRentalDaysChange}
                suggestedStartLagosYmd={suggestedRentalCalendarStartYmd}
                minSelectableLagosYmd={closetEarliestDeliveryYmd}
                afterCalendar={
                  supportsRentalDates && rentalDays > 0 ? (
                    <RentalDispatchWindowPicker
                      startDate={startDate}
                      rentalDays={rentalDays}
                      enabled
                      panelOpen={isOpen}
                      applyDeliveryFloor={applyDeliveryFloor}
                      closetEarliestDeliveryYmd={closetEarliestDeliveryYmd}
                      onPayloadChange={setDispatchWindowsPayload}
                    />
                  ) : null
                }
              />
            </div>

            {/* Footer */}
            <div className={`${slidePanelFooter} flex gap-4`}>
              <button
                type="button"
                onClick={onClose}
                className={`${buttonSecondary} flex-1`}
              >
                <Paragraph1>Shop More </Paragraph1>
              </button>

              <button
                type="button"
                onClick={handleCheckAvailability}
                disabled={isChecking}
                className={`${buttonPrimary} flex flex-1 items-center justify-center gap-1`}
              >
                {isChecking ? (
                  <>
                    <Loader2
                      className="w-4 h-4 animate-spin shrink-0"
                      aria-hidden
                    />
                    <Paragraph1>Checking…</Paragraph1>
                  </>
                ) : (
                  <Paragraph1>Check availability</Paragraph1>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      {mounted ? createPortal(panel, document.body) : null}

      <GuestContactModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onSubmit={handleGuestContactSubmit}
        isSubmitting={pendingGuestSubmit || isChecking}
      />
    </>
  );
};

// --------------------
// Main Component
// --------------------

interface RentalPeriodsProps {
  productId: string;
  listerId: string;
  dailyPrice: number;
  collateralPrice: number;
  listingType?: "RENTAL" | "RESALE" | "RENT_OR_RESALE";
  resalePrice?: number | null;
  /** When set (closet + shop nav off), replaces "Rent now" label; same click behavior. */
  closetPrimaryCtaOverride?: string;
}

const RentalPeriods: React.FC<RentalPeriodsProps> = ({
  productId,
  listerId,
  dailyPrice,
  collateralPrice,
  listingType,
  resalePrice,
  closetPrimaryCtaOverride,
}) => {
  const { isOpen, open, close } = useUrlOverlay(RENTAL_DATES_OVERLAY_PARAM);
  const primaryLabel = closetPrimaryCtaOverride?.trim() || "Check Availability";
  const useVaultClosetCtaStyle = Boolean(closetPrimaryCtaOverride?.trim());

  return (
    <>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={open}
        className={`flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-black bg-black font-semibold text-white transition hover:bg-gray-100 hover:text-black ${
          useVaultClosetCtaStyle
            ? "px-2 py-2.5 sm:px-3"
            : "px-4 py-2 text-sm"
        }`}
      >
        <Paragraph1
          className={
            useVaultClosetCtaStyle
              ? "m-0 max-w-full text-center text-[11px] leading-snug text-inherit sm:text-xs"
              : "m-0 text-center text-inherit"
          }
        >
          {primaryLabel}
        </Paragraph1>
      </button>

      {/* Filter Panel */}
      <RentalPeriodsPanel
        isOpen={isOpen}
        onClose={close}
        productId={productId}
        listerId={listerId}
        dailyPrice={dailyPrice}
        collateralPrice={collateralPrice}
        listingType={listingType}
        resalePrice={resalePrice}
      />

    </>
  );
};

export default RentalPeriods;
