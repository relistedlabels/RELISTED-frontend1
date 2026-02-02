"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Header1, Paragraph1 } from "@/common/ui/Text";

// Currency constant (fixes the TS error)
const CURRENCY = "₦";

// --- Payment Provider Data ---
interface PaymentProvider {
  id: string;
  name: string;
  logoUrl: string;
}

const paymentProviders: PaymentProvider[] = [
  {
    id: "paystack",
    name: "Paystack",
    logoUrl:
      "/icons/paystack.svg",
  },
  {
    id: "stripe",
    name: "Stripe",
    logoUrl:
      "/icons/stripe.svg",
  },
];

export default function WalletTopUpForm() {
  const [topUpAmount, setTopUpAmount] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("paystack");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setTopUpAmount(value);
  };

  return (
    <div className=" ">
      {/* --- TOP-UP AMOUNT Section --- */}
      <Paragraph1 className="text-sm font-bold text-gray-800 tracking-wider mb-4">
        TOP-UP AMOUNT
      </Paragraph1>

      <label
        htmlFor="amount-input"
        className="block text-xs font-medium text-gray-500 mb-2"
      >
        <Paragraph1>Amount</Paragraph1>
      </label>

      <div className="relative mb-8">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-lg font-bold text-gray-900">
          ₦
        </span>
        <input
          type="text"
          id="amount-input"
          value={topUpAmount}
          onChange={handleAmountChange}
          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150 text-lg font-medium"
          placeholder="0.00"
        />
      </div>

      {/* --- PAYMENT METHOD Section --- */}
      <Paragraph1 className="text-sm font-bold text-gray-800 tracking-wider mb-4">
        HOW WOULD YOU LIKE TO PAY?
      </Paragraph1>

      <div className="space-y-4">
        {paymentProviders.map((provider) => (
          <label
            key={provider.id}
            htmlFor={provider.id}
            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
              selectedProvider === provider.id
                ? "border-black shadow-lg"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 relative">
                <Image
                  src={provider.logoUrl}
                  alt={provider.name}
                  fill
                  className="object-contain"
                />
              </div>

              <Paragraph1 className="text-base font-medium text-gray-900">
                {provider.name}
              </Paragraph1>
            </div>

            <input
              type="radio"
              id={provider.id}
              name="paymentProvider"
              value={provider.id}
              checked={selectedProvider === provider.id}
              onChange={() => setSelectedProvider(provider.id)}
              className="h-4 w-4 text-black border-gray-300 focus:ring-black"
            />
          </label>
        ))}
      </div>

      {/* BUTTON
      <button
        type="button"
        className="w-full bg-black text-white font-semibold py-3 mt-8 rounded-lg hover:bg-gray-800 transition-colors"
        disabled={!topUpAmount || !selectedProvider}
      >
        <Paragraph1>
          Pay{" "}
          {topUpAmount
            ? `${CURRENCY}${parseFloat(topUpAmount).toLocaleString("en-NG")}`
            : ""}
        </Paragraph1>
      </button> */}
    </div>
  );
}
