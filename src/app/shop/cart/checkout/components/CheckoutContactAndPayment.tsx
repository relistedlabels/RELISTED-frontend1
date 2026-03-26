"use client";

import React, { useState, useEffect } from "react";
import { User, Home, Wallet, Check, Truck } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import ChangeAddress from "./ChangeAddress";
import FundWallet from "./FundWallet";
import { useMe } from "@/lib/queries/auth/useMe";
import { useProfile } from "@/lib/queries/user/useProfile";
import { useWallet } from "@/lib/queries/renters/useWallet";
import { getOrderSummaryApi } from "@/lib/api/cart";

interface CheckoutContactAndPaymentProps {
  onShippingTierSelected?: (tierName: string) => void;
  shippingTiers?: Array<{
    name: string;
    totalShippingCost: number;
    grandTotal: number;
  }>;
}

// === Skeleton Loader ===
const ContactSkeleton = () => (
  <div className="bg-gray-50 space-y-6 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="p-4 bg-white rounded-xl border border-gray-100">
        <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
        <hr className="mb-3" />
        <div className="h-4 bg-gray-200 rounded w-48"></div>
      </div>
    ))}
  </div>
);

// === Delivery Tier Helper Function ===
const getDeliveryTierDetails = (tierName: string) => {
  const name = tierName.toLowerCase();

  // Same-Day Delivery - Chowdeck & Glovo
  if (name.includes("chowdeck") || name.includes("glovo")) {
    return {
      type: "Same-Day Delivery",
      description: "Get your items today",
      deliveryTime: "Same Day",
    };
  }

  // 48-Hour Delivery - Dellyman & Errandlr
  if (name.includes("dellyman") || name.includes("errandlr")) {
    return {
      type: "48-Hour Delivery",
      description: "Delivery within 48 hours",
      deliveryTime: "48 Hours",
    };
  }

  // 3-5 Working Days - DHL
  if (name.includes("dhl") || name.includes("express")) {
    return {
      type: "3-5 Working Days (Express)",
      description: "Express delivery service",
      deliveryTime: "3-5 Working Days",
    };
  }

  // Default fallback
  return {
    type: tierName,
    description: "Standard delivery",
    deliveryTime: "Variable",
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
  const totalBalance = walletData?.totalBalance || 0;
  const availableBalance = walletData?.availableBalance || 0;
  const isWalletFunded = availableBalance > 0;

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("en-NG");
  };

  return (
    <div className="bg-gray-50 space-y-6">
      {/* 1. CONTACT Section */}
      <div className="p-4 bg-white rounded-xl border border-gray-100">
        <Paragraph1 className="font-bold text-gray-800 tracking-wider mb-3">
          CONTACT
        </Paragraph1>

        <hr className="mb-3 text-gray-300" />
        <div className="flex items-start gap-3">
          <User size={30} className="shrink-0 mt-0.5 text-gray-700" />
          <div>
            <Paragraph1 className="font-medium text-gray-900 leading-snug">
              {user.name}
            </Paragraph1>
            <Paragraph1 className="text-xs text-gray-600 leading-snug">
              {user.email}
            </Paragraph1>
            <Paragraph1 className="text-xs text-gray-600 leading-snug">
              {profile?.phoneNumber || "No phone number"}
            </Paragraph1>
          </div>
        </div>
      </div>

      {/* 2. DELIVERY ADDRESS Section */}
      <div className="p-4 bg-white rounded-xl border border-gray-100">
        <Paragraph1 className="font-bold text-gray-800 tracking-wider mb-4">
          DELIVERY ADDRESS
        </Paragraph1>
        <hr className="mb-3 text-gray-300" />

        {/* Address Row */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <Home size={30} className="shrink-0 mt-0.5 text-gray-700" />
            <Paragraph1 className="text-gray-900 leading-snug max-w-[70%]">
              {deliveryAddress}
            </Paragraph1>
          </div>
          <ChangeAddress />
        </div>
        <hr className="mb-3 text-gray-300" />

        {/* Same as Billing Checkbox */}
        <label className="flex items-center space-x-2 cursor-pointer text-gray-700 mt-2">
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
      <div className="p-4 bg-white rounded-xl border border-gray-100">
        <Paragraph1 className="font-bold text-gray-800 tracking-wider mb-4">
          SHIPPING METHOD
        </Paragraph1>
        <hr className="mb-4 text-gray-300" />

        {isLoadingShipping ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : localShippingTiers.length > 0 ? (
          <div className="space-y-3">
            {localShippingTiers.map((tier) => {
              const tierDetails = getDeliveryTierDetails(tier.name);
              return (
                <label
                  key={tier.name}
                  className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors"
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
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </span>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <Truck size={18} className="text-gray-700" />
                      <div>
                        <Paragraph1 className="font-semibold text-gray-900">
                          {tierDetails.type}
                        </Paragraph1>
                        <Paragraph1 className="text-xs text-gray-600">
                          {tierDetails.description} • {tier.name}
                        </Paragraph1>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <Paragraph1 className="text-xs text-gray-600 ml-6">
                        Shipping cost:
                      </Paragraph1>
                      <Paragraph1 className="text-sm font-bold text-gray-900">
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
      <div className="p-4 bg-white rounded-xl border border-gray-100">
        <Paragraph1 className="font-bold text-gray-800 tracking-wider mb-4">
          PAYMENT
        </Paragraph1>
        <hr className="mb-3 text-gray-300" />

        {/* Wallet Balance Row */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Wallet size={30} className="shrink-0 mt-0.5 text-gray-700" />
            <div className="space-y-2">
              <div>
                <Paragraph1 className="text-xs text-gray-600">
                  Total Balance
                </Paragraph1>
                <Paragraph1 className="font-bold text-green-700">
                  ₦{formatCurrency(totalBalance)}
                </Paragraph1>
              </div>
              <div>
                <Paragraph1 className="text-xs text-gray-600">
                  Available Balance
                </Paragraph1>
                <Paragraph1
                  className={`font-bold ${
                    isWalletFunded ? "text-green-700" : "text-red-700"
                  }`}
                >
                  ₦{formatCurrency(availableBalance)}
                </Paragraph1>
              </div>
            </div>
          </div>
          <FundWallet />
        </div>
      </div>

      {/* Footer Note */}
      {!isWalletFunded && (
        <div className="flex items-center text-xs text-gray-500 mt-4">
          <span className="mr-1 text-base">ⓘ</span>
          <Paragraph1 className="text-gray-500">
            Fund your wallet to complete this order
          </Paragraph1>
        </div>
      )}
    </div>
  );
}
