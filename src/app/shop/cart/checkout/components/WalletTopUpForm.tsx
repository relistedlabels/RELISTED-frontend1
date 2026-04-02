"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, RefreshCw, Shield } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useUpdateProfile } from "@/lib/mutations/renters/useProfileMutations";
import { useProfile } from "@/lib/queries/renters/useProfile";
import { useVerificationsStatus } from "@/lib/queries/renters/useVerifications";
import { isRenterVerifiedForFundWallet } from "@/lib/renters/fundWalletVerification";
import { useWallet } from "@/lib/queries/renters/useWallet";
import VerificationModal from "./VerificationModal";

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
  const [isVerified, setIsVerified] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationSubmittedAt, setVerificationSubmittedAt] = useState<
    number | null
  >(null);
  const [countdown, setCountdown] = useState(0);

  // Fetch profile and wallet data
  const {
    data: profileResponse,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useProfile();
  const {
    data: verificationsStatusResponse,
    isLoading: verificationsLoading,
    refetch: refetchVerificationsStatus,
  } = useVerificationsStatus();
  const {
    data: walletResponse,
    isLoading: walletLoading,
    refetch: refetchWallet,
  } = useWallet();
  const updateProfileMutation = useUpdateProfile();

  const verifications = verificationsStatusResponse?.data?.verifications;
  const satisfiesWallet = useMemo(
    () => isRenterVerifiedForFundWallet(profileResponse, verifications),
    [profileResponse, verifications],
  );

  useEffect(() => {
    if (profileLoading || verificationsLoading) return;
    setIsVerified(satisfiesWallet);
    if (satisfiesWallet) {
      setIsVerificationModalOpen(false);
    } else {
      setIsVerificationModalOpen(true);
    }
  }, [
    profileLoading,
    verificationsLoading,
    satisfiesWallet,
  ]);

  // Countdown timer
  useEffect(() => {
    if (!verificationSubmittedAt) return;

    const VERIFICATION_TIMEOUT = 10 * 60 * 1000; // 10 minutes
    const interval = setInterval(() => {
      const elapsed = Date.now() - verificationSubmittedAt;
      const remaining = VERIFICATION_TIMEOUT - elapsed;

      if (remaining <= 0) {
        setCountdown(0);
        clearInterval(interval);
      } else {
        setCountdown(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [verificationSubmittedAt]);

  const handleVerificationComplete = () => {
    setVerificationSubmittedAt(Date.now());
    setIsVerificationModalOpen(false);
  };

  const checkVerificationStatus = async () => {
    const VERIFICATION_TIMEOUT = 10 * 60 * 1000;
    if (countdown > 0) {
      const minutes = Math.floor(countdown / 60000);
      const seconds = Math.floor((countdown % 60000) / 1000);
      alert(
        `Please wait ${minutes}:${seconds.toString().padStart(2, "0")} before checking verification status.`,
      );
      return;
    }

    try {
      const [vRes, pRes] = await Promise.all([
        refetchVerificationsStatus(),
        refetchProfile(),
      ]);
      const ok = isRenterVerifiedForFundWallet(
        pRes.data,
        vRes.data?.data?.verifications,
      );
      if (ok) {
        setIsVerified(true);
        setIsVerificationModalOpen(false);
        setVerificationSubmittedAt(null);
        setCountdown(0);
        toast.success("Verification successful!");
      } else {
        alert(
          "Verification is still pending. Please try again in a few moments.",
        );
      }
    } catch (err) {
      console.error("Failed to check verification status:", err);
      alert("Failed to check verification status. Please try again.");
    }
  };

  // Extract wallet and virtual account data
  const walletData = walletResponse?.wallet?.balance;
  const totalBalance = walletData?.totalBalance ?? 0;
  const availableBalance = walletData?.availableBalance ?? 0;
  const virtualAccount = profileResponse?.virtualAccount;

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
      setVaError("Please enter both ID Number and BVN");
      return;
    }

    if (nin.length < 11) {
      setVaError("ID Number must be at least 11 digits");
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
      {/* Verification Status Messages */}
      {verificationSubmittedAt && countdown > 0 && (
        <div className="bg-blue-50 p-4 border border-blue-200 rounded-lg">
          <Paragraph1 className="text-blue-700 text-xs">
            ⏱️ Verification in progress. Please wait{" "}
            <strong>
              {Math.floor(countdown / 60000)}:
              {Math.floor((countdown % 60000) / 1000)
                .toString()
                .padStart(2, "0")}
            </strong>{" "}
            to check status.
          </Paragraph1>
        </div>
      )}

      {verificationSubmittedAt && countdown === 0 && (
        <div className="bg-amber-50 p-4 border border-amber-200 rounded-lg">
          <Paragraph1 className="text-amber-700 text-xs">
            ✓ Verification timer complete. Click below to check status.
          </Paragraph1>
        </div>
      )}

      {!isVerified && !profileLoading && !verificationsLoading && (
        <div className="flex flex-col gap-4 bg-red-50 p-6 border border-red-300 rounded-lg">
          <Paragraph1 className="font-semibold text-red-800 text-sm">
            Verification Required
          </Paragraph1>
          <Paragraph1 className="text-red-700 text-xs">
            You need to verify your identity before funding your wallet. Please
            complete the verification process below.
          </Paragraph1>

          {verificationSubmittedAt && countdown === 0 && (
            <button
              onClick={checkVerificationStatus}
              className="bg-black hover:bg-gray-900 px-4 py-2 rounded-lg w-full font-semibold text-white text-sm transition"
            >
              Check Verification Status
            </button>
          )}

          {!verificationSubmittedAt && (
            <button
              onClick={() => setIsVerificationModalOpen(true)}
              className="bg-black hover:bg-gray-900 px-4 py-2 rounded-lg w-full font-semibold text-white text-sm transition"
            >
              Verify Identity
            </button>
          )}
        </div>
      )}

      {isVerified && !profileLoading && (
        <>
          {/* --- WALLET BALANCE Section --- */}
          <div className="bg-gradient-to-r from-black to-gray-800 p-6 rounded-xl text-white">
            <div className="flex justify-between items-start mb-8">
              <div>
                <Paragraph1 className="mb-2 font-medium text-gray-300 text-xs">
                  Total Balance
                </Paragraph1>
                <Paragraph3 className="mb-3 font-bold text-3xl">
                  {CURRENCY}
                  {formatCurrency(totalBalance)}
                </Paragraph3>
                <Paragraph1 className="text-gray-400 text-xs">
                  Available: {CURRENCY}
                  {formatCurrency(availableBalance)}
                </Paragraph1>
              </div>
              <button
                type="button"
                onClick={handleRefreshBalance}
                disabled={isRefreshing || walletLoading}
                className="hover:bg-gray-700 disabled:opacity-50 p-2 rounded-lg transition-colors"
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
            <div className="bg-gray-50 p-4 border border-gray-200 rounded-xl">
              <Paragraph1 className="mb-3 font-bold text-gray-900 text-sm">
                TRANSFER MONEY DIRECTLY
              </Paragraph1>
              <div className="space-y-3 text-gray-800 text-sm">
                <div>
                  <Paragraph1 className="mb-2 text-gray-600 text-xs">
                    Bank Name
                  </Paragraph1>
                  <div className="flex justify-between items-center bg-white p-2 border border-gray-100 rounded-lg">
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
                      className="hover:bg-gray-100 p-1.5 rounded transition-colors"
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
                  <Paragraph1 className="mb-2 text-gray-600 text-xs">
                    VA Number
                  </Paragraph1>
                  <div className="flex justify-between items-center bg-white p-2 border border-gray-100 rounded-lg">
                    <Paragraph1 className="font-mono font-semibold">
                      {virtualAccount.vaNumber}
                    </Paragraph1>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyToClipboard(
                          virtualAccount.vaNumber,
                          "vaNumber",
                        )
                      }
                      className="hover:bg-gray-100 p-1.5 rounded transition-colors"
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
              <Paragraph1 className="mt-3 text-gray-600 text-xs italic">
                Transfer funds to this account and your wallet will be updated
                within minutes
              </Paragraph1>
            </div>
          ) : (
            <div className="bg-amber-50 p-4 border border-amber-300 rounded-xl">
              <Paragraph1 className="mb-3 font-bold text-amber-900 text-sm">
                GENERATE VIRTUAL ACCOUNT
              </Paragraph1>
              <Paragraph1 className="mb-4 text-amber-800 text-xs">
                To receive direct transfers, you need to generate a virtual
                account. We'll need your ID Number and BVN information.
              </Paragraph1>

              <button
                type="button"
                onClick={() => setShowVAForm(!showVAForm)}
                disabled={isGeneratingVA}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 px-4 py-2 rounded-lg w-full font-semibold text-white transition"
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
                    className="space-y-3 mt-4 pt-4 border-amber-200 border-t"
                  >
                    <div className="bg-amber-50 p-3 border border-amber-200 rounded-lg">
                      <Paragraph1 className="mb-1 font-medium text-amber-900 text-xs">
                        ⚠️ Important: Use correct BVN and ID Number
                      </Paragraph1>
                      <Paragraph1 className="text-amber-800 text-xs">
                        Ensure the BVN and ID Number you provide are accurate.
                        Incorrect information will prevent account generation
                        and affect your verification status on the platform.
                      </Paragraph1>
                    </div>

                    {vaError && (
                      <div className="bg-red-100 p-3 border border-red-300 rounded-lg">
                        <Paragraph1 className="text-red-700 text-xs">
                          {vaError}
                        </Paragraph1>
                      </div>
                    )}

                    <div>
                      <label className="block mb-1 font-medium text-gray-700 text-xs">
                        ID Number
                      </label>
                      <input
                        type="text"
                        value={nin}
                        onChange={(e) => setNin(e.target.value)}
                        placeholder="11-digit ID Number"
                        maxLength={11}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 w-full"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-medium text-gray-700 text-xs">
                        BVN (Bank Verification Number)
                      </label>
                      <input
                        type="text"
                        value={bvn}
                        onChange={(e) => setBvn(e.target.value)}
                        placeholder="11-digit BVN"
                        maxLength={11}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 w-full"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowVAForm(false);
                          setVaError("");
                        }}
                        className="flex-1 hover:bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateVA}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 px-3 py-2 rounded-lg font-medium text-white transition"
                      >
                        Generate
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* --- WEMA SECURITY FOOTER --- */}
      {isVerified && (
        <div className="flex justify-center items-center gap-2 pt-4 border-gray-200 border-t">
          <Shield size={16} className="text-gray-600" />
          <Paragraph1 className="text-gray-600 text-xs">
            Payment secured by
            <span className="ml-1 font-bold text-gray-800">Wema Bank</span>
          </Paragraph1>
        </div>
      )}

      {/* Verification Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onVerified={handleVerificationComplete}
        currentBvn={profileResponse?.bvn || ""}
        currentNin={profileResponse?.nin}
      />
    </div>
  );
}
