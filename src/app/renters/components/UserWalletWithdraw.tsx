// ENDPOINTS: GET /api/renters/wallet/bank-accounts, POST /api/renters/wallet/withdraw
// Bank rows come from PUT /api/renters/profile with bankAccountInfo (no POST …/wallet/bank-accounts).

"use client";

import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineInformationCircle } from "react-icons/hi2";
import { Info } from "lucide-react";
import { useBankAccounts } from "@/lib/queries/renters/useBankAccounts";
import { useWallet } from "@/lib/queries/renters/useWallet";
import { useWithdrawFunds } from "@/lib/mutations/renters/useWalletMutations";
import { toast } from "sonner";

export interface WithdrawalFormProps {
  /** When true, skip the balance summary (e.g. parent already shows wallet balance). */
  hideBalanceCard?: boolean;
  availableBalance?: string;
  /** Called after a successful withdrawal (e.g. close parent slide-over). */
  onWithdrawSuccess?: () => void;
}

export const WithdrawalForm: React.FC<WithdrawalFormProps> = ({
  hideBalanceCard = false,
  availableBalance: propBalance,
  onWithdrawSuccess,
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const { data: walletData } = useWallet();
  const { data: bankAccountsData, isLoading: bankLoading } = useBankAccounts();
  const withdrawMutation = useWithdrawFunds();

  const balance =
    propBalance ||
    `₦${(walletData?.wallet?.balance?.availableBalance ?? 0).toLocaleString()}`;
  const bankAccounts = bankAccountsData?.bankAccounts || [];

  const availableNum = walletData?.wallet?.balance?.availableBalance ?? 0;

  const handleWithdraw = async () => {
    console.log("[RENTER WITHDRAWAL] TEST LOG - handleWithdraw called!");
    console.log("[RENTER WITHDRAWAL] Starting withdrawal process", {
      amount,
      selectedAccountId,
      availableNum,
      bankAccountsCount: bankAccounts.length,
    });

    if (!amount || amount <= 0 || isNaN(amount)) {
      console.error("[RENTER WITHDRAWAL] Invalid amount validation failed", {
        amount,
      });
      toast.error("Please enter a valid amount");
      return;
    }

    if (!selectedAccountId) {
      console.error("[RENTER WITHDRAWAL] No bank account selected");
      toast.error("Please select a bank account");
      return;
    }

    if (amount > availableNum) {
      console.error("[RENTER WITHDRAWAL] Insufficient balance", {
        amount,
        availableNum,
      });
      toast.error("Insufficient available balance");
      return;
    }

    console.log(
      "💰 [RENTER WITHDRAWAL] All validations passed, submitting withdrawal",
    );
    const withdrawalData = { amount, bankAccountId: selectedAccountId };
    console.log(
      "💰 [RENTER WITHDRAWAL] Submitting withdrawal request:",
      withdrawalData,
    );

    withdrawMutation.mutate(withdrawalData, {
      onSuccess: () => {
        console.log("[RENTER WITHDRAWAL] Withdrawal successful");
        toast.success("Withdrawal initiated successfully!");
        setAmount(0);
        setSelectedAccountId("");
        onWithdrawSuccess?.();
      },
      onError: (error: any) => {
        console.error("[RENTER WITHDRAWAL] Withdrawal failed:", error);
        toast.error(error?.message || "Failed to initiate withdrawal");
      },
    });
  };
  return (
    <div className="bg-white font-sans text-gray-900">
      {!hideBalanceCard && (
        <div className="bg-gray-100 mb-6 p-4 rounded-xl">
          <Paragraph1 className="mb-1 text-gray-500 text-sm">
            Available Balance
          </Paragraph1>
          <div className="flex items-center space-x-2">
            <img src="/icons/lock2.png" className="w-auto h-[41px]" />
            <Paragraph1 className="font-bold text-gray-900 text-xl">
              {balance}
            </Paragraph1>
          </div>
          <Paragraph1 className="mt-1 text-gray-500 text-xs">
            Make only 5 debits in a month
          </Paragraph1>
        </div>
      )}

      {/* Amount Input */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Paragraph1 className="font-medium text-gray-900 text-sm">
            Amount
          </Paragraph1>
          <span
            className="flex items-center gap-1 text-gray-500 text-xs"
            title="Type numbers without commas. They will be formatted automatically."
          >
            <Info size={14} /> Type numbers without commas
          </span>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="0.00"
            value={amount ? amount.toLocaleString() : ""}
            onChange={(e) => {
              // Only allow numbers and remove existing commas
              let value = e.target.value.replace(/[^\d]/g, "");

              // Add commas as thousands separator
              if (value) {
                const num = parseInt(value);
                if (!isNaN(num)) {
                  value = num.toLocaleString();
                  // Store as number for state, but display formatted
                  setAmount(num);
                  return;
                }
              }

              setAmount(0);
            }}
            className="bg-white p-3 pl-8 border border-gray-300 focus:border-black rounded-lg outline-none focus:ring-2 focus:ring-black w-full text-gray-900 placeholder:text-gray-400 text-lg transition duration-150"
          />
          <span className="top-1/2 left-3 absolute font-bold text-gray-500 text-lg -translate-y-1/2 transform">
            ₦
          </span>
        </div>
      </div>

      {/* Bank Account Selection */}
      <div className="mb-4">
        <Paragraph1 className="mb-2 font-medium text-gray-900 text-sm">
          Select Bank Account
        </Paragraph1>
        {bankLoading ? (
          <div className="bg-gray-200 rounded-lg h-12 animate-pulse"></div>
        ) : bankAccounts.length === 0 ? (
          <Paragraph1 className="py-2 text-gray-600 text-sm">
            Save a bank account in this panel first (profile update with bank
            code and account number). If the list stays empty after save, the
            profile request may have failed—check the response before retrying.
          </Paragraph1>
        ) : (
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="bg-white p-3 border border-gray-300 focus:border-black rounded-lg outline-none focus:ring-2 focus:ring-black w-full text-gray-900 transition duration-150"
          >
            <option value="">Select a bank account</option>
            {bankAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.bankName} -{" "}
                {(account.accountNumber || "").slice(-4) || "—"}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Information Notice */}
      <div className="flex items-start space-x-2 bg-blue-50/50 mb-6 p-3 border border-blue-200 rounded-lg">
        <HiOutlineInformationCircle className="mt-0.5 w-5 h-5 text-blue-600 shrink-0" />
        <Paragraph1 className="text-gray-700 text-xs leading-snug">
          Withdrawals typically process within 24/48 hours. A confirmation email
          will be sent once processed.
        </Paragraph1>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleWithdraw}
        disabled={
          withdrawMutation.isPending ||
          bankAccounts.length === 0 ||
          !selectedAccountId
        }
        className="bg-black hover:bg-gray-900 disabled:opacity-50 py-3 rounded-lg w-full font-semibold text-white transition"
      >
        {withdrawMutation.isPending ? "Processing..." : "Withdraw Now"}
      </button>

      {withdrawMutation.isError && (
        <Paragraph1 className="mt-2 text-red-600 text-sm">
          Error:{" "}
          {(withdrawMutation.error as any)?.message || "Failed to withdraw"}
        </Paragraph1>
      )}
    </div>
  );
};

const ExampleWithdrawalForm: React.FC = () => <WithdrawalForm />;

export default ExampleWithdrawalForm;
