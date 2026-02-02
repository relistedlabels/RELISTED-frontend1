"use client";

import React, { useState } from "react";
import { User, Home, Wallet, Check } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import ChangeAddress from "./ChangeAddress";
import FundWallet from "./FundWallet";

// --- Placeholder Data ---
const userData = {
  name: "Esmerelda Daniels",
  email: "essydaniels@gmaim.com",
  phone: "+2348033446787",
  deliveryAddress: "01 Olusegun street, Iyana Ipaja, Lagos State, Nigeria",
  walletBalance: 0, // ₦0
};

export default function CheckoutContactAndPayment() {
  const [isSameAsBilling, setIsSameAsBilling] = useState(true);

  // Determine if the wallet balance is sufficient (for display purposes)
  const isWalletFunded = userData.walletBalance > 0;

  return (
    <div className=" bg-gray-50  space-y-6">
      {/* 1. CONTACT Section */}
      <div className="p-4 bg-white rounded-xl  border border-gray-100">
        <Paragraph1 className=" font-bold text-gray-800 tracking-wider mb-3">
          CONTACT
        </Paragraph1>

        <hr className=" mb-3 text-gray-300" />
        <div className="flex items-start gap-3">
          <User size={30} className="shrink-0 mt-0.5 text-gray-700" />
          <div>
            <Paragraph1 className=" font-medium text-gray-900 leading-snug">
              {userData.name}
            </Paragraph1>
            <Paragraph1 className="text-xs text-gray-600 leading-snug">
              {userData.email}
            </Paragraph1>
            <Paragraph1 className="text-xs text-gray-600 leading-snug">
              {userData.phone}
            </Paragraph1>
          </div>
        </div>
      </div>

      {/* 2. DELIVERY ADDRESS Section */}
      <div className="p-4 bg-white rounded-xl  border border-gray-100">
        <Paragraph1 className=" font-bold text-gray-800 tracking-wider mb-4">
          DELIVERY ADDRESS
        </Paragraph1>
        <hr className=" mb-3 text-gray-300" />

        {/* Address Row */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <Home size={30} className="shrink-0 mt-0.5 text-gray-700" />
            <Paragraph1 className=" text-gray-900 leading-snug max-w-[70%]">
              {userData.deliveryAddress}
            </Paragraph1>
          </div>
          <ChangeAddress />
        </div>
        <hr className=" mb-3 text-gray-300" />

        {/* Same as Billing Checkbox */}
        <label className="flex items-center space-x-2 cursor-pointer  text-gray-700 mt-2">
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
      <div className="p-4 bg-white rounded-xl  border border-gray-100">
        <Paragraph1 className=" font-bold text-gray-800 tracking-wider mb-4">
          PAYMENT
        </Paragraph1>
        <hr className=" mb-3 text-gray-300" />

        {/* Wallet Balance Row */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Wallet size={30} className="text-gray-700" />
            <div>
              <Paragraph1 className=" font-medium text-gray-900">
                Wallet Balance
              </Paragraph1>
              <Paragraph1 className="text-xs font-bold ">
                NO
                {/* Display actual balance if funded: ₦{userData.walletBalance.toLocaleString('en-NG')} */}
              </Paragraph1>
            </div>
          </div>
          <FundWallet />
        </div>
      </div>

      {/* Footer Note */}
      <div className="flex items-center text-xs text-gray-500 mt-4">
        <span className="mr-1 text-base">ⓘ</span>
        <Paragraph1 className="text-gray-500">
          Fund your wallet to complete this order
        </Paragraph1>
      </div>
    </div>
  );
}
