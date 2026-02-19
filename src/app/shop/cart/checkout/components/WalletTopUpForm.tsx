"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Paragraph1 } from "@/common/ui/Text";
import { useDepositFunds } from "@/lib/mutations/renters/useWalletMutations";

// Currency constant
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
    logoUrl: "/icons/paystack.svg",
  },
  {
    id: "stripe",
    name: "Stripe",
    logoUrl: "/icons/stripe.svg",
  },
];

interface WalletTopUpFormProps {
  onClose?: () => void;
}

export default function WalletTopUpForm({ onClose }: WalletTopUpFormProps) {
  const [topUpAmount, setTopUpAmount] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("paystack");
  const depositFunds = useDepositFunds();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setTopUpAmount(value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    depositFunds.mutate(
      {
        amount,
        paymentMethod: selectedProvider,
      },
      {
        onSuccess: () => {
          setTopUpAmount("");
          if (onClose) onClose();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          required
          disabled={depositFunds.isPending}
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
                ? "border-black shadow-lg bg-gray-50"
                : "border-gray-200 hover:border-gray-400"
            } ${depositFunds.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
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
              className="h-4 w-4 text-black border-gray-300 focus:ring-black cursor-pointer"
              disabled={depositFunds.isPending}
            />
          </label>
        ))}
      </div>

      {/* Error Message */}
      {depositFunds.isError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <Paragraph1 className="text-xs text-red-700">
            {depositFunds.error?.message || "Failed to process deposit"}
          </Paragraph1>
        </div>
      )}

      {/* Success Message */}
      {depositFunds.isSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <Paragraph1 className="text-xs text-green-700">
            Wallet funded successfully!
          </Paragraph1>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-black text-white font-semibold py-3 mt-8 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        disabled={!topUpAmount || !selectedProvider || depositFunds.isPending}
      >
        <Paragraph1>
          {depositFunds.isPending
            ? "Processing..."
            : topUpAmount
              ? `Pay ${CURRENCY}${parseFloat(topUpAmount).toLocaleString("en-NG")}`
              : "Enter Amount"}
        </Paragraph1>
      </button>
    </form>
  );
}
