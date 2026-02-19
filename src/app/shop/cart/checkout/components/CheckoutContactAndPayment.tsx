"use client";

import React, { useState } from "react";
import { User, Home, Wallet, Check } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import ChangeAddress from "./ChangeAddress";
import FundWallet from "./FundWallet";
import { useMe } from "@/lib/queries/auth/useMe";
import { useProfile } from "@/lib/queries/user/useProfile";

// === Skeleton Loader ===
const ContactSkeleton = () => (
  <div className="bg-gray-50 space-y-6 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="p-4 bg-white rounded-xl border border-gray-100">
        <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
        <hr className="mb-3" />
        <div className="h-4 bg-gray-200 rounded w-48"></div>
      </div>
    ))}
  </div>
);

export default function CheckoutContactAndPayment() {
  const { data: user } = useMe();
  const { data: profile } = useProfile();
  const [isSameAsBilling, setIsSameAsBilling] = useState(true);

  if (!user) return <ContactSkeleton />;

  const deliveryAddress = profile?.address
    ? `${profile.address.street}, ${profile.address.city}, ${profile.address.state}, ${profile.address.country}`
    : "No address set";

  const walletBalance = profile?.wallet?.balance || 0;
  const isWalletFunded = walletBalance > 0;

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

      {/* 3. PAYMENT Section */}
      <div className="p-4 bg-white rounded-xl border border-gray-100">
        <Paragraph1 className="font-bold text-gray-800 tracking-wider mb-4">
          PAYMENT
        </Paragraph1>
        <hr className="mb-3 text-gray-300" />

        {/* Wallet Balance Row */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Wallet size={30} className="text-gray-700" />
            <div>
              <Paragraph1 className="font-medium text-gray-900">
                Wallet Balance
              </Paragraph1>
              <Paragraph1
                className={`text-xs font-bold ${
                  isWalletFunded ? "text-green-700" : "text-red-700"
                }`}
              >
                ₦{formatCurrency(walletBalance)}
              </Paragraph1>
            </div>
          </div>
          {!isWalletFunded && <FundWallet />}
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
