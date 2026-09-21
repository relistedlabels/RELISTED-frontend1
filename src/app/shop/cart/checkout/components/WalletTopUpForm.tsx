"use client";

import { RefreshCw, Shield } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import FundWalletIdUpload from "@/app/renters/components/FundWalletIdUpload";
import FundWalletTransferCard from "@/app/renters/components/FundWalletTransferCard";
import { Paragraph1 } from "@/common/ui/Text";
import { buttonPrimaryFull, buttonSecondary } from "@/common/ui/buttonClasses";
import { useProfile } from "@/lib/queries/renters/useProfile";
import { useVerificationsStatus } from "@/lib/queries/renters/useVerifications";
import { isRenterVerifiedForFundWallet } from "@/lib/renters/fundWalletVerification";
import { useWallet } from "@/lib/queries/renters/useWallet";

const CURRENCY = "₦";

interface WalletTopUpFormProps {
  isActive?: boolean;
}

function mapVerificationPhase(
  status: string | undefined,
): "none" | "pending" | "verified" | "failed" {
  const s = (status ?? "").toLowerCase().trim();
  if (!s || s === "not_verified") return "none";
  if (
    s === "verified" ||
    s === "approved" ||
    s === "success" ||
    s === "complete" ||
    s === "completed"
  ) {
    return "verified";
  }
  if (s === "failed" || s === "rejected" || s === "declined") {
    return "failed";
  }
  return "pending";
}

export default function WalletTopUpForm({ isActive = true }: WalletTopUpFormProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingVa, setIsLoadingVa] = useState(false);

  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useProfile(isActive);
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
  const isVerified = useMemo(
    () => isRenterVerifiedForFundWallet(profile, verifications),
    [profile, verifications],
  );
  const verificationPhase = mapVerificationPhase(
    verifications?.validId?.status,
  );

  const refreshFundWalletState = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchVerificationsStatus(),
        refetchProfile(),
        refetchWallet(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchProfile, refetchVerificationsStatus, refetchWallet]);

  useEffect(() => {
    if (!isActive) return;
    void refreshFundWalletState();
  }, [isActive, refreshFundWalletState]);

  useEffect(() => {
    if (!isActive || !isVerified) return;
    void refetchProfile();
  }, [isActive, isVerified, refetchProfile]);

  const walletData = walletResponse?.wallet?.balance;
  const availableBalance = walletData?.availableBalance ?? 0;
  const virtualAccount = profile?.virtualAccount;
  const isLoading = profileLoading || verificationsLoading;

  const formatCurrency = (value: number): string =>
    value.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleLoadTransferAccount = async () => {
    setIsLoadingVa(true);
    try {
      const result = await refetchProfile();
      const vaNumber = result.data?.virtualAccount?.vaNumber;
      if (!vaNumber) {
        toast.error(
          "Transfer account is not ready yet. Try again in a moment.",
        );
        return;
      }
      toast.success("Your transfer account is ready.");
    } catch {
      toast.error("Could not load your transfer account. Please try again.");
    } finally {
      setIsLoadingVa(false);
    }
  };

  return (
    <div className="space-y-5">
      {isLoading ? (
        <div className="py-8 text-center">
          <Paragraph1 className="text-gray-500 text-sm">Loading...</Paragraph1>
        </div>
      ) : null}

      {!isLoading && !isVerified ? (
        <div className="space-y-4">
          {verificationPhase === "pending" ? (
            <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl">
              <Paragraph1 className="font-semibold text-amber-950 text-sm">
                ID under review
              </Paragraph1>
              <Paragraph1 className="mt-1 text-amber-900 text-xs leading-relaxed">
                Your document was uploaded. Refresh when review is complete to
                get your transfer account.
              </Paragraph1>
              <button
                type="button"
                onClick={() => void refreshFundWalletState()}
                disabled={isRefreshing}
                className={`${buttonSecondary} mt-3 w-full`}
              >
                {isRefreshing ? "Refreshing..." : "Refresh status"}
              </button>
            </div>
          ) : verificationPhase === "failed" ? (
            <div className="bg-red-50 p-4 border border-red-200 rounded-xl">
              <Paragraph1 className="font-semibold text-red-900 text-sm">
                Verification failed
              </Paragraph1>
              <Paragraph1 className="mt-1 text-red-800 text-xs leading-relaxed">
                Upload a clear ID photo below to try again.
              </Paragraph1>
            </div>
          ) : null}

          {verificationPhase !== "pending" ? (
            <FundWalletIdUpload
              onUploaded={() => {
                void refreshFundWalletState();
              }}
            />
          ) : null}
        </div>
      ) : null}

      {!isLoading && isVerified ? (
        <>
          <div className="bg-gradient-to-r from-black to-gray-800 p-5 rounded-xl text-white">
            <div className="flex justify-between items-start gap-3">
              <div>
                <Paragraph1 className="mb-1 font-medium text-gray-300 text-xs">
                  Available balance
                </Paragraph1>
                <Paragraph1 className="font-bold text-2xl">
                  {CURRENCY}
                  {formatCurrency(availableBalance)}
                </Paragraph1>
              </div>
              <button
                type="button"
                onClick={() => void refreshFundWalletState()}
                disabled={isRefreshing || walletLoading}
                className="hover:bg-gray-700 disabled:opacity-50 p-2 rounded-lg transition-colors"
                aria-label="Refresh wallet balance"
              >
                <RefreshCw
                  size={18}
                  className={isRefreshing ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {virtualAccount?.vaNumber ? (
            <FundWalletTransferCard
              bankName={virtualAccount.bankName || "Wema Bank"}
              accountNumber={virtualAccount.vaNumber}
            />
          ) : (
            <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl">
              <Paragraph1 className="mb-2 font-semibold text-amber-950 text-sm">
                Get your transfer account
              </Paragraph1>
              <Paragraph1 className="mb-4 text-amber-900 text-xs leading-relaxed">
                We will create a personal account number for bank transfers.
              </Paragraph1>
              <button
                type="button"
                onClick={() => void handleLoadTransferAccount()}
                disabled={isLoadingVa}
                className={buttonPrimaryFull}
              >
                {isLoadingVa ? "Loading account..." : "Get transfer account"}
              </button>
            </div>
          )}

          <div className="flex justify-center items-center gap-2 pt-2 border-gray-200 border-t">
            <Shield size={16} className="text-gray-600" />
            <Paragraph1 className="text-gray-600 text-xs">
              Payment secured by
              <span className="ml-1 font-bold text-gray-800">Wema Bank</span>
            </Paragraph1>
          </div>
        </>
      ) : null}
    </div>
  );
}
