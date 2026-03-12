"use client";
// ENDPOINTS: POST /api/listers/wallet/withdraw (submit withdrawal), GET /api/listers/wallet/bank-accounts
import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineInformationCircle, HiOutlineCheckCircle, HiOutlinePencil, HiOutlinePlus } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { useWalletStats } from "@/lib/queries/listers/useWalletStats";
import { useBankAccounts } from "@/lib/queries/listers/useBankAccounts";
import { useWithdrawFunds } from "@/lib/mutations/listers/useWithdrawFunds";
import { AddNewBankAccountPanel } from "./AddNewBankAccount";
import EditBankAccountPanel from "./EditBankAccountPanel";

const ExampleWithdrawalForm: React.FC = () => {
  const [amount, setAmount] = useState<string>("");
  const [selectedBankAccount, setSelectedBankAccount] = useState<{
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<{
    id: string;
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | null>(null);

  const { data: walletStats, isLoading: isLoadingWallet } = useWalletStats();
  const { data: bankAccounts } = useBankAccounts(true);
  const withdrawMutation = useWithdrawFunds();

  const availableBalance = walletStats?.data?.availableBalance ?? 0;
  const displayBalance = `₦${availableBalance.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const handleSelectAccount = (account: any) => {
    setSelectedBankAccount(account);
    setError("");
  };

  const handleEditAccount = (account: any) => {
    setEditingAccount(account);
    setIsEditAccountOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditAccountOpen(false);
    setEditingAccount(null);
  };

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
      bankAccountId: selectedBankAccount.id,
      notes: notes || undefined,
    });
  };

  const accounts = bankAccounts?.data || [];

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

      {/* Bank Account Selection - Step 1 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <Paragraph1 className="text-sm font-medium text-gray-900">
            Select Account to Withdraw To
          </Paragraph1>
          <motion.button
            onClick={() => setIsAddAccountOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            <HiOutlinePlus size={16} />
            <span>Add Account</span>
          </motion.button>
        </div>
        
        {accounts.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <Paragraph1 className="text-sm text-gray-500">
              No bank accounts added.
            </Paragraph1>
            <motion.button
              onClick={() => setIsAddAccountOpen(true)}
              className="mt-3 text-sm font-medium text-black underline hover:text-gray-700 transition"
            >
              Add your first bank account
            </motion.button>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <motion.div
                key={account.id}
                className={`w-full text-left p-4 rounded-lg border-2 transition duration-200 relative overflow-hidden ${
                  selectedBankAccount?.id === account.id
                    ? "border-black bg-black/5"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <motion.button
                    onClick={() => handleSelectAccount(account)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 text-left"
                  >
                    {/* Checkmark indicator */}
                    {selectedBankAccount?.id === account.id && (
                      <div className="absolute top-3 left-full transform -translate-x-12 text-black">
                        <HiOutlineCheckCircle size={20} className="fill-black" />
                      </div>
                    )}
                    
                    <Paragraph1 className="text-sm font-semibold text-gray-900 leading-tight">
                      {account.bankName}
                    </Paragraph1>
                    <Paragraph1 className="text-xs text-gray-600 mt-1">
                      Account: {account.accountNumber.slice(-4).padStart(account.accountNumber.length, '*')}
                    </Paragraph1>
                    <Paragraph1 className="text-xs text-gray-500 mt-2 font-medium">
                      {account.accountName}
                    </Paragraph1>
                  </motion.button>
                  
                  {/* Edit button */}
                  <motion.button
                    onClick={() => handleEditAccount(account)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition shrink-0"
                  >
                    <HiOutlinePencil size={18} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Amount Input - Show only when account is selected */}
      <AnimatePresence>
        {selectedBankAccount && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
              Withdrawal Amount
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes (Optional) - Show only when account is selected */}
      <AnimatePresence>
        {selectedBankAccount && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6"
        >
          <Paragraph1 className="text-xs text-red-700">{error}</Paragraph1>
        </motion.div>
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
      <motion.button
        onClick={handleWithdraw}
        disabled={withdrawMutation.isPending || !amount || !selectedBankAccount}
        whileHover={{ scale: !withdrawMutation.isPending && amount && selectedBankAccount ? 1.02 : 1 }}
        whileTap={{ scale: !withdrawMutation.isPending && amount && selectedBankAccount ? 0.98 : 1 }}
        className="w-full px-4 py-3 font-semibold bg-black text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        <Paragraph1>
          {withdrawMutation.isPending ? "Processing..." : "Request Withdrawal"}
        </Paragraph1>
      </motion.button>

      {withdrawMutation.isSuccess && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="p-3 bg-green-50 border border-green-200 rounded-lg mt-4"
        >
          <Paragraph1 className="text-xs text-green-700">
            Withdrawal request submitted successfully! Check your email for
            confirmation.
          </Paragraph1>
        </motion.div>
      )}

      {withdrawMutation.isError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg mt-4"
        >
          <Paragraph1 className="text-xs text-red-700">
            {withdrawMutation.error?.message ||
              "Failed to process withdrawal. Please try again."}
          </Paragraph1>
        </motion.div>
      )}

      {/* Add Bank Account Modal */}
      <AddNewBankAccountPanel
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
      />

      {/* Edit Bank Account Modal */}
      <EditBankAccountPanel
        isOpen={isEditAccountOpen}
        onClose={handleCloseEdit}
        account={editingAccount}
      />
    </div>
  );
};

export default ExampleWithdrawalForm;
