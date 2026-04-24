"use client";

import { Check, Clock, Home, Truck, User, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { getOrderSummaryApi } from "@/lib/api/cart";
import { useMe } from "@/lib/queries/auth/useMe";
import { useWallet } from "@/lib/queries/renters/useWallet";
import { useProfile } from "@/lib/queries/user/useProfile";
import ChangeAddress from "./ChangeAddress";
import FundWallet from "./FundWallet";

interface CheckoutContactAndPaymentProps {
  onShippingTierSelected?: (tierName: string) => void;
  shippingTiers?: Array<{
    name: string;
    totalShippingCost: number;
    grandTotal: number;
  }>;
}

const CONTACT_SKELETON_KEYS = [
  "contact-1",
  "contact-2",
  "contact-3",
  "contact-4",
];
const SHIPPING_SKELETON_KEYS = ["shipping-1", "shipping-2", "shipping-3"];
const SAME_DAY_TIER_KEYWORDS = ["chowdeck", "errandlr", "dellyman", "glovo"];
const SAME_DAY_CUTOFF_DISCLAIMER =
  "Orders placed after 11:00am WAT (Lagos time) may be delivered the next day.";

const isSameDayShippingTierName = (tierName: string) => {
  const normalized = tierName.toLowerCase();
  return SAME_DAY_TIER_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

// === Skeleton Loader ===
const ContactSkeleton = () => (
  <div className="space-y-6 bg-gray-50 animate-pulse">
    {CONTACT_SKELETON_KEYS.map((key) => (
      <div key={key} className="bg-white p-4 border border-gray-100 rounded-xl">
        <div className="bg-gray-200 mb-3 rounded w-32 h-5"></div>
        <hr className="mb-3" />
        <div className="bg-gray-200 rounded w-48 h-4"></div>
      </div>
    ))}
  </div>
);

// === Reservation Timer Component ===
const ReservationTimer = () => {
  const [timeLeft, setTimeLeft] = useState<string>("15:00");

  useEffect(() => {
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000);

    const updateTimer = () => {
      const now = Date.now();
      const expiryTimeMs = expiryTime.getTime();
      const distance = expiryTimeMs - now;

      if (distance <= 0) {
        setTimeLeft("0:00");
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 bg-amber-50 mb-6 p-4 border border-amber-200 rounded-xl">
      <Clock className="w-6 h-6 text-amber-700 shrink-0" />
      <Paragraph1 className="font-medium text-amber-900">
        These items are reserved for{" "}
        <span className="font-bold">{timeLeft}</span> — complete payment to
        secure these items
      </Paragraph1>
    </div>
  );
};

// === Delivery Tier Helper Function ===
const getDeliveryTierDetails = (tierName: string) => {
  return {
    type: tierName,
    description: "Shipping partner",
  };
};

export default function CheckoutContactAndPayment({
  onShippingTierSelected,
  shippingTiers = [],
}: CheckoutContactAndPaymentProps) {
  const { data: user } = useMe();
  const { data: profile } = useProfile();
  const { data: walletResponse } = useWallet();
  const [isSameAsBilling, setIsSameAsBilling] = useState(true);
  const [selectedShippingTier, setSelectedShippingTier] = useState<string>(
    shippingTiers[0]?.name || "",
  );
  const [localShippingTiers, setLocalShippingTiers] = useState(shippingTiers);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);

  // Fetch shipping tiers if not provided
  useEffect(() => {
    if (shippingTiers.length === 0) {
      const fetchShippingTiers = async () => {
        setIsLoadingShipping(true);
        try {
          const response = await getOrderSummaryApi();
          if (response.data?.shippingTiers) {
            setLocalShippingTiers(response.data.shippingTiers);
            const defaultTier = response.data.shippingTiers[0];
            if (defaultTier?.name) {
              setSelectedShippingTier(defaultTier.name);
              onShippingTierSelected?.(defaultTier.name);
            }
          }
        } catch (err) {
          console.error("Failed to fetch shipping tiers:", err);
        } finally {
          setIsLoadingShipping(false);
        }
      };
      fetchShippingTiers();
    } else {
      setLocalShippingTiers(shippingTiers);
      const defaultTier = shippingTiers[0];
      if (defaultTier?.name) {
        setSelectedShippingTier(defaultTier.name);
        onShippingTierSelected?.(defaultTier.name);
      }
    }
  }, [shippingTiers, onShippingTierSelected]);

  const handleShippingTierChange = (tierName: string) => {
    setSelectedShippingTier(tierName);
    onShippingTierSelected?.(tierName);
  };

  if (!user) return <ContactSkeleton />;

  const deliveryAddress = profile?.address
    ? `${profile.address.street}, ${profile.address.city}, ${profile.address.state}, ${profile.address.country}`
    : "No address set";

  const walletData = walletResponse?.wallet?.balance;
  const availableBalance = walletData?.availableBalance || 0;
  const isWalletFunded = availableBalance > 0;

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("en-NG");
  };

  return (
    <div className="space-y-6 bg-gray-50">
      {/* Payment expiring timer */}
      <ReservationTimer />

      {/* 1. CONTACT Section */}
      <div className="bg-white p-4 border border-gray-100 rounded-xl">
        <Paragraph1 className="mb-3 font-bold text-gray-800 tracking-wider">
          CONTACT
        </Paragraph1>

        <hr className="mb-3 text-gray-300" />
        <div className="flex items-start gap-3">
          <User size={30} className="mt-0.5 text-gray-700 shrink-0" />
          <div>
            <Paragraph1 className="font-medium text-gray-900 leading-snug">
              {user.name}
            </Paragraph1>
            <Paragraph1 className="text-gray-600 text-xs leading-snug">
              {user.email}
            </Paragraph1>
            <Paragraph1 className="text-gray-600 text-xs leading-snug">
              {profile?.phoneNumber || "No phone number"}
            </Paragraph1>
          </div>
        </div>
      </div>

      {/* 2. DELIVERY ADDRESS Section */}
      <div className="bg-white p-4 border border-gray-100 rounded-xl">
        <Paragraph1 className="mb-4 font-bold text-gray-800 tracking-wider">
          DELIVERY ADDRESS
        </Paragraph1>
        <hr className="mb-3 text-gray-300" />

        {/* Address Row */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <Home size={30} className="mt-0.5 text-gray-700 shrink-0" />
            <Paragraph1 className="max-w-[70%] text-gray-900 leading-snug">
              {deliveryAddress}
            </Paragraph1>
          </div>
          <ChangeAddress />
        </div>
        <hr className="mb-3 text-gray-300" />

        {/* Same as Billing Checkbox */}
        <label className="flex items-center space-x-2 mt-2 text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={isSameAsBilling}
            onChange={() => setIsSameAsBilling(!isSameAsBilling)}
            className="hidden" // Hide default checkbox
          />
          <span
            className={`w-6 h-6 rounded border ${
              isSameAsBilling
                ? "bg-black border-black"
                : "bg-white border-gray-400"
            } flex items-center justify-center`}
          >
            {isSameAsBilling && <Check size={18} className="text-white" />}
          </span>
          <Paragraph1>Same as billing address</Paragraph1>
        </label>
      </div>

      {/* 3. SHIPPING METHOD Section */}
      <div className="bg-white p-4 border border-gray-100 rounded-xl">
        <Paragraph1 className="mb-4 font-bold text-gray-800 tracking-wider">
          SHIPPING METHOD
        </Paragraph1>
        <hr className="mb-4 text-gray-300" />

        {isLoadingShipping ? (
          <div className="space-y-2">
            {SHIPPING_SKELETON_KEYS.map((key) => (
              <div
                key={key}
                className="bg-gray-200 rounded-lg h-16 animate-pulse"
              ></div>
            ))}
          </div>
        ) : localShippingTiers.length > 0 ? (
          <div className="space-y-3">
            {[...localShippingTiers]
              .filter((tier) => {
                const isExpress =
                  tier.name.toLowerCase().includes("dhl") ||
                  tier.name.toLowerCase().includes("express");
                return !isExpress;
              })
              .map((tier) => {
                const tierDetails = getDeliveryTierDetails(tier.name);
                const isSameDay = isSameDayShippingTierName(tier.name);
                return (
                  <label
                    key={tier.name}
                    className="flex items-center p-3 border-2 rounded-lg transition-colors cursor-pointer"
                    style={{
                      borderColor:
                        selectedShippingTier === tier.name ? "#000" : "#e5e7eb",
                      backgroundColor:
                        selectedShippingTier === tier.name
                          ? "#f9fafb"
                          : "#ffffff",
                    }}
                  >
                    <input
                      type="radio"
                      name="shippingTier"
                      value={tier.name}
                      checked={selectedShippingTier === tier.name}
                      onChange={() => handleShippingTierChange(tier.name)}
                      className="hidden"
                    />
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedShippingTier === tier.name
                          ? "bg-black border-black"
                          : "bg-white border-gray-400"
                      }`}
                    >
                      {selectedShippingTier === tier.name && (
                        <div className="bg-white rounded-full w-2 h-2"></div>
                      )}
                    </span>
                    <div className="flex-1 ml-3">
                      <div className="flex items-center gap-2">
                        <Truck size={18} className="text-gray-700" />
                        <div>
                          <Paragraph1 className="font-semibold text-gray-900">
                            {tierDetails.type}
                          </Paragraph1>
                          <Paragraph1 className="text-gray-600 text-xs">
                            {tierDetails.description}
                          </Paragraph1>
                          {isSameDay && (
                            <Paragraph1 className="mt-1 text-amber-700 text-xs">
                              {SAME_DAY_CUTOFF_DISCLAIMER}
                            </Paragraph1>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <Paragraph1 className="ml-6 text-gray-600 text-xs">
                          Shipping cost:
                        </Paragraph1>
                        <Paragraph1 className="font-bold text-gray-900 text-sm">
                          ₦{formatCurrency(tier.totalShippingCost)}
                        </Paragraph1>
                      </div>
                    </div>
                  </label>
                );
              })}
          </div>
        ) : (
          <Paragraph1 className="text-gray-600 text-sm">
            No shipping methods available
          </Paragraph1>
        )}
      </div>

      {/* 4. PAYMENT Section */}
      <div className="bg-white p-4 border border-gray-100 rounded-xl">
        <Paragraph1 className="mb-4 font-bold text-gray-800 tracking-wider">
          PAYMENT
        </Paragraph1>
        <hr className="mb-3 text-gray-300" />

        {/* Wallet Balance Row */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-1 items-start gap-3">
            <Wallet size={30} className="mt-0.5 text-gray-700 shrink-0" />
            <div className="space-y-2">
              <div>
                <Paragraph1 className="text-gray-600 text-xs">
                  Available Balance
                </Paragraph1>
                <Paragraph3
                  className={`font-bold ${
                    isWalletFunded ? "text-green-700" : "text-red-700"
                  }`}
                >
                  ₦{formatCurrency(availableBalance)}
                </Paragraph3>
              </div>
            </div>
          </div>
          <FundWallet />
        </div>
      </div>

      {/* Footer Note */}
      {!isWalletFunded && (
        <div className="flex items-center mt-4 text-gray-500 text-xs">
          <span className="mr-1 text-base">ⓘ</span>
          <Paragraph1 className="text-gray-500">
            Fund your wallet to complete this order
          </Paragraph1>
        </div>
      )}
    </div>
  );
}
