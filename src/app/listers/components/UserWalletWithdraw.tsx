"use client";
// ENDPOINTS: POST /api/listers/wallet/withdraw (submit withdrawal), GET /api/listers/wallet/bank-accounts
import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineInformationCircle } from "react-icons/hi2";
import { useWalletStats } from "@/lib/queries/listers/useWalletStats";
import { useBankAccounts } from "@/lib/queries/listers/useBankAccounts";
import { useWithdrawFunds } from "@/lib/mutations/listers/useWithdrawFunds";
import ExampleBankAccountsDropdown from "./BankAccountsDropdownContent";

const ExampleWithdrawalForm: React.FC = () => {
  const [amount, setAmount] = useState<string>("");
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { data: walletStats, isLoading: isLoadingWallet } = useWalletStats();
  const { data: bankAccounts } = useBankAccounts(true);
  const withdrawMutation = useWithdrawFunds();

  const availableBalance = walletStats?.data?.availableBalance ?? 0;
  const displayBalance = `₦${availableBalance.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const handleWithdraw = async () => {
    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!selectedBankAccount) {
      setError("Please select a bank account");
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount < 10000) {
      setError("Minimum withdrawal amount is ₦10,000");
      return;
    }

    if (withdrawAmount > availableBalance) {
      setError("Insufficient balance");
      return;
    }

    setError("");

    // Submit withdrawal
    withdrawMutation.mutate({
      amount: withdrawAmount,
      bankAccountId: selectedBankAccount,
      notes: notes || undefined,
    });
  };

  return (
    <div className="font-sans bg-white">
      {/* Available Balance Display */}
      <div className="p-4 bg-gray-100 rounded-xl mb-6">
        <Paragraph1 className="text-sm text-gray-500 mb-1">
          Available Balance
        </Paragraph1>
        {isLoadingWallet ? (
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
        ) : (
          <div className="flex items-center space-x-2">
            <img src="/icons/lock2.png" className="h-[41px] w-auto" />
            <Paragraph1 className="text-xl font-bold text-gray-900">
              {displayBalance}
            </Paragraph1>
          </div>
        )}
        <Paragraph1 className="text-xs text-gray-500 mt-1">
          Make only 5 withdrawals per month
        </Paragraph1>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Amount
        </Paragraph1>
        <div className="relative">
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError("");
            }}
            className="w-full p-3 pl-8 text-lg border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg text-gray-500 font-bold">
            ₦
          </span>
        </div>
      </div>

      {/* Bank Account Selection */}
      <ExampleBankAccountsDropdown onSelect={setSelectedBankAccount} />

      {/* Notes (Optional) */}
      <div className="mb-4">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Notes (Optional)
        </Paragraph1>
        <textarea
          placeholder="Add any notes for this withdrawal..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150 resize-none"
          rows={3}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
          <Paragraph1 className="text-xs text-red-700">{error}</Paragraph1>
        </div>
      )}

      {/* Information Notice */}
      <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg flex items-start space-x-2 mb-6">
        <HiOutlineInformationCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <Paragraph1 className="text-xs text-gray-700 leading-snug">
          Withdrawals typically process within 24-48 hours. A confirmation email
          will be sent once processed.
        </Paragraph1>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleWithdraw}
        disabled={withdrawMutation.isPending || !amount || !selectedBankAccount}
        className="w-full px-4 py-3 font-semibold bg-black text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        <Paragraph1>
          {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
        </Paragraph1>
      </button>

      {withdrawMutation.isSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg mt-4">
          <Paragraph1 className="text-xs text-green-700">
            Withdrawal request submitted successfully! Check your email for
            confirmation.
          </Paragraph1>
        </div>
      )}

      {withdrawMutation.isError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
          <Paragraph1 className="text-xs text-red-700">
            {withdrawMutation.error?.message ||
              "Failed to process withdrawal. Please try again."}
          </Paragraph1>
        </div>
      )}
    </div>
  );
};

export default ExampleWithdrawalForm;
