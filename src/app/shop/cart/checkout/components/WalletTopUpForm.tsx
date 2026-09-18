"use client";

import { Check, Copy, RefreshCw, Shield } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useProfile } from "@/lib/queries/renters/useProfile";
import { useVerificationsStatus } from "@/lib/queries/renters/useVerifications";
import { isRenterVerifiedForFundWallet } from "@/lib/renters/fundWalletVerification";
import { useWallet } from "@/lib/queries/renters/useWallet";
import VerificationModal from "./VerificationModal";
import { buttonPrimaryFull } from "@/common/ui/buttonClasses";

// Currency constant
const CURRENCY = "₦";

interface WalletTopUpFormProps {
  onClose?: () => void;
}

export default function WalletTopUpForm({ onClose }: WalletTopUpFormProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingVA, setIsGeneratingVA] = useState(false);
  const [vaError, setVaError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationSubmittedAt, setVerificationSubmittedAt] = useState<
    number | null
  >(null);
  const [countdown, setCountdown] = useState(0);
  /** Avoid reopening the verification modal after the user closes it when queries refetch. */
  const verificationModalDismissedRef = useRef(false);

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
  const verifications = verificationsStatusResponse?.data?.verifications;
  const satisfiesWallet = useMemo(
    () => isRenterVerifiedForFundWallet(profileResponse, verifications),
    [profileResponse, verifications],
  );

  useEffect(() => {
    if (profileLoading || verificationsLoading) return;
    setIsVerified(satisfiesWallet);
    if (satisfiesWallet) {
      verificationModalDismissedRef.current = false;
      setIsVerificationModalOpen(false);
    } else if (!verificationModalDismissedRef.current) {
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
    verificationModalDismissedRef.current = true;
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
    setIsGeneratingVA(true);

    try {
      const result = await refetchProfile();
      const vaNumber = result.data?.virtualAccount?.vaNumber;
      if (!vaNumber) {
        setVaError(
          "Could not load your transfer account yet. Please try again in a moment.",
        );
        return;
      }
      await refetchWallet();
      toast.success("Your transfer account is ready.");
    } catch {
      setVaError("An error occurred. Please try again.");
    } finally {
      setIsGeneratingVA(false);
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
              className={buttonPrimaryFull}
            >
              Check Verification Status
            </button>
          )}

          {!verificationSubmittedAt && (
            <button
              type="button"
              onClick={() => {
                verificationModalDismissedRef.current = false;
                setIsVerificationModalOpen(true);
              }}
              className={buttonPrimaryFull}
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
                GET TRANSFER DETAILS
              </Paragraph1>
              <Paragraph1 className="mb-4 text-amber-800 text-xs">
                Load your personal transfer account to fund your wallet by bank
                transfer.
              </Paragraph1>

              {vaError && (
                <div className="bg-red-100 mb-3 p-3 border border-red-300 rounded-lg">
                  <Paragraph1 className="text-red-700 text-xs">{vaError}</Paragraph1>
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerateVA}
                disabled={isGeneratingVA}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 px-4 py-2 rounded-lg w-full font-semibold text-white transition"
              >
                {isGeneratingVA ? "Loading account..." : "Get transfer account"}
              </button>
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
        onClose={() => {
          verificationModalDismissedRef.current = true;
          setIsVerificationModalOpen(false);
        }}
        onVerified={handleVerificationComplete}
      />
    </div>
  );
}
