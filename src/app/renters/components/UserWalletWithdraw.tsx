// ENDPOINTS: GET /api/renters/wallet/bank-accounts, POST /api/renters/wallet/withdraw

"use client";

import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineInformationCircle } from "react-icons/hi2";
import { FaWallet } from "react-icons/fa";
import { useBankAccounts } from "@/lib/queries/renters/useBankAccounts";
import { useWallet } from "@/lib/queries/renters/useWallet";
import { useWithdrawFunds } from "@/lib/mutations/renters/useWalletMutations";
import BankAccountsDropdownContent from "./BankAccountsDropdownContent";

interface WithdrawalFormProps {
  availableBalance?: string;
}

const WithdrawalForm: React.FC<WithdrawalFormProps> = ({
  availableBalance: propBalance,
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const { data: walletData } = useWallet();
  const { data: bankAccountsData, isLoading: bankLoading } = useBankAccounts();
  const withdrawMutation = useWithdrawFunds();

  const balance =
    propBalance || `₦${(walletData?.availableBalance ?? 0).toLocaleString()}`;
  const bankAccounts = bankAccountsData?.bankAccounts || [];

  const handleWithdraw = async () => {
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!selectedAccountId) {
      alert("Please select a bank account");
      return;
    }

    withdrawMutation.mutate(
      { amount, bankAccountId: selectedAccountId },
      {
        onSuccess: () => {
          alert("Withdrawal initiated successfully!");
          setAmount(0);
          setSelectedAccountId("");
        },
        onError: (error: any) => {
          alert(error?.message || "Failed to initiate withdrawal");
        },
      },
    );
  };
  return (
    <div className="font-sans bg-white">
      {/* Available Balance Display */}
      <div className="p-4 bg-gray-100 rounded-xl mb-6">
        <Paragraph1 className="text-sm text-gray-500 mb-1">
          Available Balance
        </Paragraph1>
        <div className="flex items-center space-x-2">
          <img src="/icons/lock2.png" className="h-[41px] w-auto" />
          <Paragraph1 className="text-xl font-bold text-gray-900">
            {balance}
          </Paragraph1>
        </div>
        <Paragraph1 className="text-xs text-gray-500 mt-1">
          Make only 5 debits in a month
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
            value={amount || ""}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full p-3 pl-8 text-lg border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg text-gray-500 font-bold">
            ₦
          </span>
        </div>
      </div>

      {/* Bank Account Selection */}
      <div className="mb-4">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Select Bank Account
        </Paragraph1>
        {bankLoading ? (
          <div className="animate-pulse h-12 bg-gray-200 rounded-lg"></div>
        ) : (
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150"
          >
            <option value="">Select a bank account</option>
            {bankAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.bankName} - {account.accountNumber.slice(-4)}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Information Notice */}
      <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg flex items-start space-x-2 mb-6">
        <HiOutlineInformationCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <Paragraph1 className="text-xs text-gray-700 leading-snug">
          Withdrawals typically process within 24/48 hours. A confirmation email
          will be sent once processed.
        </Paragraph1>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleWithdraw}
        disabled={withdrawMutation.isPending}
        className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 disabled:opacity-50 transition"
      >
        {withdrawMutation.isPending ? "Processing..." : "Withdraw Now"}
      </button>

      {withdrawMutation.isError && (
        <Paragraph1 className="text-red-600 text-sm mt-2">
          Error:{" "}
          {(withdrawMutation.error as any)?.message || "Failed to withdraw"}
        </Paragraph1>
      )}
    </div>
  );
};

// --- Example Usage ---

const ExampleWithdrawalForm: React.FC = () => {
  return <WithdrawalForm availableBalance="₦280,000.00" />;
};

export default ExampleWithdrawalForm;
