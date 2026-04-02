"use client";
// ENDPOINTS: GET /api/listers/wallet/bank-accounts, GET /api/listers/profile, PUT /api/listers/profile (bankAccountInfo), GET /api/listers/wallet, POST /api/listers/wallet/withdraw
import React, { useMemo, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  HiOutlineInformationCircle,
  HiOutlineCheckCircle,
  HiOutlinePencil,
  HiOutlinePlus,
} from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { useWalletBalance } from "@/lib/queries/listers/useWalletBalance";
import { useListerProfile } from "@/lib/queries/listers/useListerProfile";
import { useBankAccounts } from "@/lib/queries/listers/useBankAccounts";
import { useWithdrawFunds } from "@/lib/mutations/listers/useWithdrawFunds";
import { useUpdateListerProfile } from "@/lib/mutations/listers/useUpdateListerProfile";
import {
  resolveRenterBankByName,
  type RenterBankOption,
} from "@/lib/renters/renterBankOptions";
import { useNgBankOptions } from "@/lib/queries/useNgBankOptions";

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
  const [isUpdateProfileOpen, setIsUpdateProfileOpen] = useState(false);
  const [withdrawalReference, setWithdrawalReference] = useState<string>("");
  const [showWithdrawalStatus, setShowWithdrawalStatus] = useState(false);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState<string>("");
  const [editingAccount, setEditingAccount] = useState<{
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | null>(null);
  const [profileFormData, setProfileFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [profileError, setProfileError] = useState<string>("");

  const { data: walletBalance, isLoading: isLoadingWallet } =
    useWalletBalance();
  const { data: profileResponse } = useListerProfile();
  const { data: walletBankPayload, isLoading: walletBankLoading } =
    useBankAccounts(undefined);
  const withdrawMutation = useWithdrawFunds();
  const updateProfileMutation = useUpdateListerProfile();
  const { bankOptions } = useNgBankOptions("NG");

  const availableBalance =
    walletBalance?.data?.wallet?.balance?.availableBalance ?? 0;
  const displayBalance = `₦${availableBalance.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const walletBankRows = walletBankPayload?.bankAccounts ?? [];
  const profileBankRows =
    profileResponse?.data?.profile?.bankAccounts ?? [];
  /** Prefer wallet API rows (real BankAccount ids for withdraw); fallback to profile. */
  const accounts =
    walletBankRows.length > 0 ? walletBankRows : profileBankRows;

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

  const filteredBanks = useMemo(
    () =>
      bankOptions.filter((bank) =>
        bank.bankName.toLowerCase().includes(bankSearch.toLowerCase()),
      ),
    [bankOptions, bankSearch],
  );

  const handleSelectBank = (bank: RenterBankOption) => {
    setProfileFormData({
      ...profileFormData,
      bankName: bank.bankName,
    });
    setIsBankDropdownOpen(false);
    setBankSearch("");
  };

  const handleUpdateProfile = () => {
    setProfileError("");
    if (
      !profileFormData.bankName?.trim() ||
      !profileFormData.accountNumber?.trim() ||
      !profileFormData.accountName?.trim()
    ) {
      setProfileError("Please fill in all bank account details");
      return;
    }

    const bankEntry = resolveRenterBankByName(
      profileFormData.bankName.trim(),
      bankOptions,
    );
    if (!bankEntry) {
      setProfileError(
        "Select a bank from the list so we can send a valid bank code.",
      );
      return;
    }

    updateProfileMutation.mutate(
      {
        bankAccountInfo: {
          bankName: bankEntry.bankName,
          bankCode: bankEntry.bankCode,
          accountNumber: profileFormData.accountNumber.trim(),
          accountName: profileFormData.accountName.trim(),
        },
        bankAccount: {
          bankName: bankEntry.bankName,
          accountNumber: profileFormData.accountNumber.trim(),
          accountName: profileFormData.accountName.trim(),
        },
      },
      {
        onSuccess: () => {
          setIsUpdateProfileOpen(false);
          setProfileFormData({
            bankName: "",
            accountNumber: "",
            accountName: "",
          });
        },
        onError: () => {
          setProfileError("Failed to update bank account. Please try again.");
        },
      },
    );
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
    withdrawMutation.mutate(
      {
        amount: withdrawAmount,
        bankAccountId: selectedBankAccount.id,
        notes: notes || undefined,
      },
      {
        onSuccess: (data: any) => {
          // Generate/set withdrawal reference
          const ref =
            data?.data?.id ||
            `WD-${Date.now().toString().slice(-8).toUpperCase()}`;
          setWithdrawalReference(ref);
          setShowWithdrawalStatus(true);
          // Reset form
          setAmount("");
          setNotes("");
          setSelectedBankAccount(null);
        },
      },
    );
  };

  return (
    <div className="font-sans bg-white text-gray-900">
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

      {/* Profile Account Details - Step 0 */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <Paragraph1 className="text-sm font-medium text-gray-900 mb-1">
              Account Details
            </Paragraph1>
            {walletBankLoading && accounts.length === 0 ? (
              <Paragraph1 className="text-xs text-gray-500">
                Loading linked accounts…
              </Paragraph1>
            ) : accounts && accounts.length > 0 ? (
              <div>
                <Paragraph1 className="text-xs text-gray-600">
                  {accounts[0].accountName} • {accounts[0].bankName}
                </Paragraph1>
                <Paragraph1 className="text-xs text-gray-500 mt-1">
                  {(accounts[0].accountNumber || "")
                    .slice(-4)
                    .padStart(
                      (accounts[0].accountNumber || "").length || 4,
                      "*",
                    )}
                </Paragraph1>
                {(accounts[0] as { verificationStatus?: string })
                  .verificationStatus ? (
                  <Paragraph1 className="text-xs text-amber-800 bg-amber-100/80 rounded px-2 py-1 mt-2 inline-block">
                    Bank verification:{" "}
                    {
                      (accounts[0] as { verificationStatus?: string })
                        .verificationStatus
                    }
                  </Paragraph1>
                ) : null}
              </div>
            ) : (
              <Paragraph1 className="text-xs text-amber-700">
                No account details added yet
              </Paragraph1>
            )}
          </div>
          <motion.button
            onClick={() => {
              if (accounts && accounts.length > 0) {
                setEditingAccount(accounts[0]);
                setIsEditAccountOpen(true);
              } else {
                setProfileFormData({
                  bankName: "",
                  accountNumber: "",
                  accountName: "",
                });
                setIsUpdateProfileOpen(true);
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            <HiOutlinePencil size={16} />
            <span>{accounts && accounts.length > 0 ? "Change" : "Add"}</span>
          </motion.button>
        </div>
      </div>

      {/* Bank Account Selection - Step 1 */}
      <div className="mb-6">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-3">
          Select Account to Withdraw To
        </Paragraph1>

        {walletBankLoading && accounts.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <Paragraph1 className="text-sm text-gray-500">
              No accounts available. Add bank details below (saved via your
              profile) or wait for the wallet list to refresh.
            </Paragraph1>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <motion.div
                key={
                  account.id ||
                  `${account.bankName}-${account.accountNumber}`
                }
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
                        <HiOutlineCheckCircle
                          size={20}
                          className="fill-black"
                        />
                      </div>
                    )}

                    <Paragraph1 className="text-sm font-semibold text-gray-900 leading-tight">
                      {account.bankName}
                    </Paragraph1>
                    <Paragraph1 className="text-xs text-gray-600 mt-1">
                      Account:{" "}
                      {(account.accountNumber || "")
                        .slice(-4)
                        .padStart(
                          (account.accountNumber || "").length || 4,
                          "*",
                        )}
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
                className="w-full p-3 pl-8 text-lg text-gray-900 bg-white border border-gray-300 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none transition duration-150"
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
              className="w-full p-3 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none transition duration-150 resize-none"
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
        whileHover={{
          scale:
            !withdrawMutation.isPending && amount && selectedBankAccount
              ? 1.02
              : 1,
        }}
        whileTap={{
          scale:
            !withdrawMutation.isPending && amount && selectedBankAccount
              ? 0.98
              : 1,
        }}
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
          className="p-4 bg-green-50 border border-green-200 rounded-lg mt-4 space-y-3"
        >
          <Paragraph1 className="text-sm font-semibold text-green-900">
            ✓ Withdrawal Request Submitted
          </Paragraph1>
          <Paragraph1 className="text-xs text-gray-700">
            Your withdrawal request has been submitted and is pending admin
            approval. The funds will be transferred to your selected account
            once processed.
          </Paragraph1>

          {/* Withdrawal Reference Number */}
          <div className="bg-white rounded-lg p-3 border border-green-100">
            <Paragraph1 className="text-xs text-gray-600 mb-1">
              Reference Number
            </Paragraph1>
            <div className="flex items-center justify-between gap-2">
              <Paragraph1 className="text-sm font-mono font-bold text-gray-900">
                {withdrawalReference}
              </Paragraph1>
              <motion.button
                onClick={() => {
                  navigator.clipboard.writeText(withdrawalReference);
                }}
                className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
              >
                Copy
              </motion.button>
            </div>
          </div>

          {/* Withdrawal Status Section */}
          <div className="bg-white rounded-lg p-3 border border-green-100 space-y-2">
            <Paragraph1 className="text-xs font-medium text-gray-900">
              Withdrawal Details
            </Paragraph1>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-gray-900">
                  ₦{amount ? parseFloat(amount).toLocaleString() : "0"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Account:</span>
                <span className="font-semibold text-gray-900">
                  {selectedBankAccount?.bankName}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Status:</span>
                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded">
                  Pending Admin Approval
                </span>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <motion.button
            onClick={() => {
              withdrawMutation.reset();
              setShowWithdrawalStatus(false);
              setWithdrawalReference("");
            }}
            className="w-full px-3 py-2 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Make Another Withdrawal
          </motion.button>
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
      {/* Removed: AddNewBankAccountPanel - account details now managed through profile update */}

      {/* Update Profile Details - Inline Expandable Form */}
      <AnimatePresence>
        {isUpdateProfileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 bg-white border border-gray-200 rounded-lg space-y-4"
          >
            <div>
              <Paragraph1 className="text-sm font-semibold text-gray-900 mb-3">
                {accounts && accounts.length > 0 ? "Update" : "Add"} Bank
                Account
              </Paragraph1>

              {profileError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <Paragraph1 className="text-xs text-red-700">
                    {profileError}
                  </Paragraph1>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <div className="relative">
                  <motion.button
                    onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-left bg-white text-gray-900 hover:border-gray-400 transition flex items-center justify-between"
                  >
                    <span
                      className={
                        profileFormData.bankName
                          ? "text-gray-900"
                          : "text-gray-500"
                      }
                    >
                      {profileFormData.bankName || "Select a bank"}
                    </span>
                    <svg
                      className={`w-4 h-4 transition ${
                        isBankDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </motion.button>

                  {/* Bank Dropdown Menu */}
                  <AnimatePresence>
                    {isBankDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
                      >
                        {/* Search Input */}
                        <div className="p-3 border-b border-gray-200">
                          <input
                            type="text"
                            placeholder="Search banks..."
                            value={bankSearch}
                            onChange={(e) => setBankSearch(e.target.value)}
                            className="w-full p-2 text-gray-900 bg-white border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none"
                            autoFocus
                          />
                        </div>

                        {/* Bank List */}
                        <div className="max-h-60 overflow-y-auto">
                          {filteredBanks.length > 0 ? (
                            filteredBanks.map((bank) => (
                              <motion.button
                                key={bank.bankCode}
                                onClick={() => handleSelectBank(bank)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition ${
                                  profileFormData.bankName === bank.bankName
                                    ? "bg-black text-white"
                                    : "text-gray-900"
                                }`}
                                whileHover={{ x: 4 }}
                              >
                                {bank.bankName}
                              </motion.button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              No banks found
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={profileFormData.accountNumber}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      accountNumber: e.target.value,
                    })
                  }
                  className="w-full p-3 text-gray-900 bg-white border border-gray-300 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none"
                  placeholder="Enter 10-digit account number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={profileFormData.accountName}
                  onChange={(e) =>
                    setProfileFormData({
                      ...profileFormData,
                      accountName: e.target.value,
                    })
                  }
                  className="w-full p-3 text-gray-900 bg-white border border-gray-300 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none"
                  placeholder="Name on account"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={() => setIsUpdateProfileOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleUpdateProfile}
                disabled={
                  updateProfileMutation.isPending ||
                  !profileFormData.bankName?.trim()
                }
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 disabled:bg-gray-400 transition"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Bank Account Modal */}
      {/* <EditBankAccountPanel
        isOpen={isEditAccountOpen}
        onClose={handleCloseEdit}
        account={editingAccount}
      /> */}
    </div>
  );
};

export default ExampleWithdrawalForm;
