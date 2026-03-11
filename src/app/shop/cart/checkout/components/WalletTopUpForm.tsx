"use client";

import React, { useState } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { RefreshCw, Check, Copy, Shield } from "lucide-react";
import { useProfile } from "@/lib/queries/user/useProfile";

// Currency constant
const CURRENCY = "₦";

interface WalletTopUpFormProps {
  onClose?: () => void;
}

export default function WalletTopUpForm({ onClose }: WalletTopUpFormProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch profile data
  const { data: profile, isLoading: balanceLoading, refetch } = useProfile();

  // Extract wallet and virtual account data
  const walletBalance = profile?.wallet?.balance ?? 0;
  const virtualAccount = profile?.virtualAccount;

  const formatCurrency = (value: number): string => {
    return value.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* --- WALLET BALANCE Section --- */}
      <div className="bg-gradient-to-r from-black to-gray-800 rounded-xl p-6 text-white">
        <div className="flex justify-between items-start mb-8">
          <div>
            <Paragraph1 className="text-xs font-medium text-gray-300 mb-2">
              Current Wallet Balance
            </Paragraph1>
            <Paragraph3 className="text-3xl font-bold">
              {CURRENCY}
              {formatCurrency(walletBalance)}
            </Paragraph3>
          </div>
          <button
            type="button"
            onClick={handleRefreshBalance}
            disabled={isRefreshing || balanceLoading}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={20}
              className={isRefreshing ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {/* --- VIRTUAL ACCOUNT Section --- */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <Paragraph1 className="text-sm font-bold text-gray-900 mb-3">
          TRANSFER MONEY DIRECTLY
        </Paragraph1>
        <div className="space-y-3 text-sm text-gray-800">
          <div>
            <Paragraph1 className="text-xs text-gray-600 mb-2">
              Bank Name
            </Paragraph1>
            <div className="flex justify-between items-center bg-white rounded-lg p-2 border border-gray-100">
              <Paragraph1 className="font-semibold">
                {virtualAccount?.bankName || "Wema Bank"}
              </Paragraph1>
              <button
                type="button"
                onClick={() =>
                  handleCopyToClipboard(
                    virtualAccount?.bankName || "Wema Bank",
                    "bankName",
                  )
                }
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              >
                {copiedField === "bankName" ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} className="text-gray-600" />
                )}
              </button>
            </div>
          </div>
          <div>
            <Paragraph1 className="text-xs text-gray-600 mb-2">
              Account Number
            </Paragraph1>
            <div className="flex justify-between items-center bg-white rounded-lg p-2 border border-gray-100">
              <Paragraph1 className="font-semibold">
                {virtualAccount?.accountNumber || "0000000000"}
              </Paragraph1>
              <button
                type="button"
                onClick={() =>
                  handleCopyToClipboard(
                    virtualAccount?.accountNumber || "0000000000",
                    "accountNumber",
                  )
                }
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              >
                {copiedField === "accountNumber" ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} className="text-gray-600" />
                )}
              </button>
            </div>
          </div>
          <div>
            <Paragraph1 className="text-xs text-gray-600 mb-2">
              Account Name
            </Paragraph1>
            <div className="flex justify-between items-center bg-white rounded-lg p-2 border border-gray-100">
              <Paragraph1 className="font-semibold">
                {virtualAccount?.accountName || "Relisted-User"}
              </Paragraph1>
              <button
                type="button"
                onClick={() =>
                  handleCopyToClipboard(
                    virtualAccount?.accountName || "Relisted-User",
                    "accountName",
                  )
                }
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              >
                {copiedField === "accountName" ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} className="text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
        <Paragraph1 className="text-xs text-gray-600 mt-3 italic">
          Transfer funds to this account and your wallet will be updated within
          minutes
        </Paragraph1>
      </div>

      {/* --- WEMA SECURITY FOOTER --- */}
      <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200">
        <Shield size={16} className="text-gray-600" />
        <Paragraph1 className="text-xs text-gray-600">
          Payment secured by
          <span className="font-bold text-gray-800 ml-1">Wema Bank</span>
        </Paragraph1>
      </div>
    </div>
  );
}
