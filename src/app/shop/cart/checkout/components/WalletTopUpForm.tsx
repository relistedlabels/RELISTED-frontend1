"use client";

import React, { useState, useEffect } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { RefreshCw, Check, Copy, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/lib/queries/renters/useProfile";
import { useWallet } from "@/lib/queries/renters/useWallet";
import { useUpdateProfile } from "@/lib/mutations/renters/useProfileMutations";
import { toast } from "sonner";

// Currency constant
const CURRENCY = "₦";

interface WalletTopUpFormProps {
  onClose?: () => void;
}

export default function WalletTopUpForm({ onClose }: WalletTopUpFormProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingVA, setIsGeneratingVA] = useState(false);
  const [vaLoadingStep, setVaLoadingStep] = useState<
    "idle" | "saving" | "generating"
  >("idle");
  const [showVAForm, setShowVAForm] = useState(false);
  const [nin, setNin] = useState("");
  const [bvn, setBvn] = useState("");
  const [vaError, setVaError] = useState("");

  // Fetch profile and wallet data
  const {
    data: profileResponse,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useProfile();
  const {
    data: walletResponse,
    isLoading: walletLoading,
    refetch: refetchWallet,
  } = useWallet();
  const updateProfileMutation = useUpdateProfile();

  // Extract wallet and virtual account data
  const walletData = walletResponse?.wallet?.balance;
  const totalBalance = walletData?.totalBalance ?? 0;
  const availableBalance = walletData?.availableBalance ?? 0;
  const virtualAccount = profileResponse?.profile?.virtualAccount;
  const profile = profileResponse?.profile;

  const formatCurrency = (value: number): string => {
    return value.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchProfile(), refetchWallet()]);
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

  const handleGenerateVA = async () => {
    setVaError("");

    if (!nin.trim() || !bvn.trim()) {
      setVaError("Please enter both NIN and BVN");
      return;
    }

    if (nin.length < 11) {
      setVaError("NIN must be at least 11 digits");
      return;
    }

    if (bvn.length < 11) {
      setVaError("BVN must be at least 11 digits");
      return;
    }

    setIsGeneratingVA(true);
    setVaLoadingStep("saving");

    try {
      // Simulate "Saving..." for 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Switch to "Generating account..."
      setVaLoadingStep("generating");

      // Call the update profile mutation with NIN and BVN
      await new Promise((saveResolve) => {
        updateProfileMutation.mutate(
          {
            nin,
            bvn,
          },
          {
            onSuccess: () => {
              // Wait for the backend to process (5 more seconds)
              setTimeout(() => {
                saveResolve(null);
              }, 5000);
            },
            onError: (error: any) => {
              setVaError(
                error?.message || "Failed to generate virtual account",
              );
              saveResolve(null);
            },
          },
        );
      });

      // Refetch profile to get the new virtual account
      await refetchProfile();
      await refetchWallet();

      setIsGeneratingVA(false);
      setVaLoadingStep("idle");
      setShowVAForm(false);
      setNin("");
      setBvn("");
      toast.success("Virtual account created successfully!");
    } catch (error) {
      setIsGeneratingVA(false);
      setVaLoadingStep("idle");
      setVaError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* --- WALLET BALANCE Section --- */}
      <div className="bg-gradient-to-r from-black to-gray-800 rounded-xl p-6 text-white">
        <div className="flex justify-between items-start mb-8">
          <div>
            <Paragraph1 className="text-xs font-medium text-gray-300 mb-2">
              Total Balance
            </Paragraph1>
            <Paragraph3 className="text-3xl font-bold mb-3">
              {CURRENCY}
              {formatCurrency(totalBalance)}
            </Paragraph3>
            <Paragraph1 className="text-xs text-gray-400">
              Available: {CURRENCY}
              {formatCurrency(availableBalance)}
            </Paragraph1>
          </div>
          <button
            type="button"
            onClick={handleRefreshBalance}
            disabled={isRefreshing || walletLoading}
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
      {virtualAccount && virtualAccount.vaNumber ? (
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
                  {virtualAccount.bankName || "Wema Bank"}
                </Paragraph1>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyToClipboard(
                      virtualAccount.bankName || "Wema Bank",
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
                VA Number
              </Paragraph1>
              <div className="flex justify-between items-center bg-white rounded-lg p-2 border border-gray-100">
                <Paragraph1 className="font-semibold font-mono">
                  {virtualAccount.vaNumber}
                </Paragraph1>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyToClipboard(virtualAccount.vaNumber, "vaNumber")
                  }
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                >
                  {copiedField === "vaNumber" ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <Copy size={16} className="text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <Paragraph1 className="text-xs text-gray-600 mt-3 italic">
            Transfer funds to this account and your wallet will be updated
            within minutes
          </Paragraph1>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
          <Paragraph1 className="text-sm font-bold text-amber-900 mb-3">
            GENERATE VIRTUAL ACCOUNT
          </Paragraph1>
          <Paragraph1 className="text-xs text-amber-800 mb-4">
            To receive direct transfers, you need to generate a virtual account.
            We'll need your NIN and BVN information.
          </Paragraph1>

          <button
            type="button"
            onClick={() => setShowVAForm(!showVAForm)}
            disabled={isGeneratingVA}
            className="w-full px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
          >
            {isGeneratingVA ? (
              <span>
                {vaLoadingStep === "saving"
                  ? "Saving..."
                  : "Generating account..."}
              </span>
            ) : (
              "Generate Virtual Account"
            )}
          </button>

          {/* Inline VA Form */}
          <AnimatePresence>
            {showVAForm && !isGeneratingVA && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-amber-200 space-y-3"
              >
                {vaError && (
                  <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                    <Paragraph1 className="text-xs text-red-700">
                      {vaError}
                    </Paragraph1>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-700 font-medium mb-1">
                    NIN (National ID Number)
                  </label>
                  <input
                    type="text"
                    value={nin}
                    onChange={(e) => setNin(e.target.value)}
                    placeholder="11-digit NIN"
                    maxLength={11}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-700 font-medium mb-1">
                    BVN (Bank Verification Number)
                  </label>
                  <input
                    type="text"
                    value={bvn}
                    onChange={(e) => setBvn(e.target.value)}
                    placeholder="11-digit BVN"
                    maxLength={11}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVAForm(false);
                      setVaError("");
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateVA}
                    className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition"
                  >
                    Generate
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

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
