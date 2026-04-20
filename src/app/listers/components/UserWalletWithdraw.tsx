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
import { toast } from "sonner";

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
  const profileBankRows = profileResponse?.data?.profile?.bankAccounts ?? [];
  /** Prefer wallet API rows (real BankAccount ids for withdraw); fallback to profile. */
  const accounts = walletBankRows.length > 0 ? walletBankRows : profileBankRows;

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
        bankAccounts: {
          bankName: bankEntry.bankName,
          bankCode: bankEntry.bankCode,
          accountNumber: profileFormData.accountNumber.trim(),
          accountName: profileFormData.accountName.trim(),
        },
        bankAccount: {
            bankName: bankEntry.bankName,
            bankCode: bankEntry.bankCode,
            accountNumber: profileFormData.accountNumber.trim(),
            accountName: profileFormData.accountName.trim(),
          },
      },
      {
        onSuccess: () => {
          toast.success("Bank account updated successfully!");
          setIsUpdateProfileOpen(false);
          setProfileFormData({
            bankName: "",
            accountNumber: "",
            accountName: "",
          });
        },
        onError: () => {
          const errorMessage = "Failed to update bank account. Please try again.";
          setProfileError(errorMessage);
          toast.error(errorMessage);
        },
      },
    );
  };

  const handleWithdraw = async () => {
    console.log("[WITHDRAWAL] Starting withdrawal process", {
      amount,
      selectedBankAccount: selectedBankAccount?.id,
      availableBalance,
      notes,
    });

    // Validation
    const parsedAmount = parseFloat(amount.replace(/,/g, ""));
    console.log("[WITHDRAWAL] Validating amount:", { amount, parsedAmount });
    if (!amount || parsedAmount <= 0 || isNaN(parsedAmount)) {
      console.error("[WITHDRAWAL] Invalid amount validation failed", {
        amount,
        parsedAmount,
      });
      setError("Please enter a valid amount");
      return;
    }

    if (!selectedBankAccount) {
      console.error("[WITHDRAWAL] No bank account selected");
      setError("Please select a bank account");
      return;
    }

    const withdrawAmount = parsedAmount;
    console.log("[WITHDRAWAL] Checking minimum amount", {
      withdrawAmount,
      minimum: 10000,
    });
    if (withdrawAmount < 10000) {
      console.error("[WITHDRAWAL] Minimum amount validation failed", {
        withdrawAmount,
        minimum: 10000,
      });
      setError("Minimum withdrawal amount is ₦10,000");
      return;
    }

    console.log("[WITHDRAWAL] Checking balance", {
      withdrawAmount,
      availableBalance,
    });
    if (withdrawAmount > availableBalance) {
      console.error("[WITHDRAWAL] Insufficient balance", {
        withdrawAmount,
        availableBalance,
      });
      setError("Insufficient balance");
      return;
    }

    console.log(
      " [WITHDRAWAL] All validations passed, submitting withdrawal",
    );
    setError("");

    // Submit withdrawal
    const withdrawalData = {
      amount: withdrawAmount,
      bankAccountId: selectedBankAccount.id,
      notes: notes || undefined,
    };
    console.log(
      " [WITHDRAWAL] Submitting withdrawal request:",
      withdrawalData,
    );

    withdrawMutation.mutate(withdrawalData, {
      onSuccess: (data: any) => {
        console.log("[WITHDRAWAL] Withdrawal successful:", data);
        toast.success("Withdrawal request submitted successfully!");
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
      onError: (error: any) => {
        console.error("[WITHDRAWAL] Withdrawal failed:", error);
        const errorMessage = error?.message || "Withdrawal failed. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      },
    });
  };

  return (
    <div className="bg-white font-sans text-gray-900">
      {/* Available Balance Display */}
      <div className="bg-gray-100 mb-6 p-4 rounded-xl">
        <Paragraph1 className="mb-1 text-gray-500 text-sm">
          Available Balance
        </Paragraph1>
        {isLoadingWallet ? (
          <div className="bg-gray-200 rounded h-8 animate-pulse" />
        ) : (
          <div className="flex items-center space-x-2">
            <img src="/icons/lock2.png" className="w-auto h-[41px]" />
            <Paragraph1 className="font-bold text-gray-900 text-xl">
              {displayBalance}
            </Paragraph1>
          </div>
        )}
        <Paragraph1 className="mt-1 text-gray-500 text-xs">
          Make only 5 withdrawals per month
        </Paragraph1>
      </div>

      {/* Profile Account Details - Step 0 */}
      <div className="bg-amber-50 mb-6 p-4 border border-amber-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <Paragraph1 className="mb-1 font-medium text-gray-900 text-sm">
              Account Details
            </Paragraph1>
            {walletBankLoading && accounts.length === 0 ? (
              <Paragraph1 className="text-gray-500 text-xs">
                Loading linked accounts…
              </Paragraph1>
            ) : accounts && accounts.length > 0 ? (
              <div>
                <Paragraph1 className="text-gray-600 text-xs">
                  {accounts[0].accountName} • {accounts[0].bankName}
                </Paragraph1>
                <Paragraph1 className="mt-1 text-gray-500 text-xs">
                  {(accounts[0].accountNumber || "")
                    .slice(-4)
                    .padStart(
                      (accounts[0].accountNumber || "").length || 4,
                      "*",
                    )}
                </Paragraph1>
                {(accounts[0] as { verificationStatus?: string })
                  .verificationStatus ? (
                  <Paragraph1 className="inline-block bg-amber-100/80 mt-2 px-2 py-1 rounded text-amber-800 text-xs">
                    Bank verification:{" "}
                    {
                      (accounts[0] as { verificationStatus?: string })
                        .verificationStatus
                    }
                  </Paragraph1>
                ) : null}
              </div>
            ) : (
              <Paragraph1 className="text-amber-700 text-xs">
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
            className="flex items-center space-x-1 bg-black hover:bg-gray-800 px-3 py-2 rounded-lg font-medium text-white text-xs transition"
          >
            <HiOutlinePencil size={16} />
            <span>{accounts && accounts.length > 0 ? "Change" : "Add"}</span>
          </motion.button>
        </div>
      </div>

      {/* Bank Account Selection - Step 1 */}
      <div className="mb-6">
        <Paragraph1 className="mb-3 font-medium text-gray-900 text-sm">
          Select Account to Withdraw To
        </Paragraph1>

        {walletBankLoading && accounts.length === 0 ? (
          <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
            <div className="bg-gray-200 rounded h-10 animate-pulse" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg text-center">
            <Paragraph1 className="text-gray-500 text-sm">
              No accounts available. Add bank details below (saved via your
              profile) or wait for the wallet list to refresh.
            </Paragraph1>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <motion.div
                key={
                  account.id || `${account.bankName}-${account.accountNumber}`
                }
                className={`w-full text-left p-4 rounded-lg border-2 transition duration-200 relative overflow-hidden ${
                  selectedBankAccount?.id === account.id
                    ? "border-black bg-black/5"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <motion.button
                    onClick={() => handleSelectAccount(account)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 text-left"
                  >
                    {/* Checkmark indicator */}
                    {selectedBankAccount?.id === account.id && (
                      <div className="top-3 left-full absolute text-black -translate-x-12 transform">
                        <HiOutlineCheckCircle
                          size={20}
                          className="fill-black"
                        />
                      </div>
                    )}

                    <Paragraph1 className="font-semibold text-gray-900 text-sm leading-tight">
                      {account.bankName}
                    </Paragraph1>
                    <Paragraph1 className="mt-1 text-gray-600 text-xs">
                      Account:{" "}
                      {(account.accountNumber || "")
                        .slice(-4)
                        .padStart(
                          (account.accountNumber || "").length || 4,
                          "*",
                        )}
                    </Paragraph1>
                    <Paragraph1 className="mt-2 font-medium text-gray-500 text-xs">
                      {account.accountName}
                    </Paragraph1>
                  </motion.button>

                  {/* Edit button */}
                  <motion.button
                    onClick={() => handleEditAccount(account)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="hover:bg-gray-100 p-2 rounded-lg text-gray-500 hover:text-gray-900 transition shrink-0"
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
            <div className="flex items-center gap-2 mb-2">
              <Paragraph1 className="font-medium text-gray-900 text-sm">
                Withdrawal Amount
              </Paragraph1>
              <span
                className="text-gray-500 text-xs"
                title="Type numbers without commas. They will be formatted automatically."
              >
                💡 Type numbers without commas
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  // Only allow numbers and remove existing commas
                  let value = e.target.value.replace(/[^\d]/g, "");

                  // Add commas as thousands separator
                  if (value) {
                    const num = parseInt(value);
                    if (!isNaN(num)) {
                      value = num.toLocaleString();
                    }
                  }

                  setAmount(value);
                  setError("");
                }}
                className="bg-white p-3 pl-8 border border-gray-300 focus:border-black rounded-lg outline-none focus:ring-2 focus:ring-black w-full text-gray-900 placeholder:text-gray-400 text-lg transition duration-150"
              />
              <span className="top-1/2 left-3 absolute font-bold text-gray-500 text-lg -translate-y-1/2 transform">
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
            <Paragraph1 className="mb-2 font-medium text-gray-900 text-sm">
              Notes (Optional)
            </Paragraph1>
            <textarea
              placeholder="Add any notes for this withdrawal..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white p-3 border border-gray-300 focus:border-black rounded-lg outline-none focus:ring-2 focus:ring-black w-full text-gray-900 placeholder:text-gray-400 text-sm transition duration-150 resize-none"
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
          className="bg-red-50 mb-6 p-3 border border-red-200 rounded-lg"
        >
          <Paragraph1 className="text-red-700 text-xs">{error}</Paragraph1>
        </motion.div>
      )}

      {/* Information Notice */}
      <div className="flex items-start space-x-2 bg-blue-50/50 mb-6 p-3 border border-blue-200 rounded-lg">
        <HiOutlineInformationCircle className="mt-0.5 w-5 h-5 text-blue-600 shrink-0" />
        <Paragraph1 className="text-gray-700 text-xs leading-snug">
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
        className="bg-black hover:bg-gray-900 disabled:bg-gray-400 px-4 py-3 rounded-lg w-full font-semibold text-white transition disabled:cursor-not-allowed"
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
          className="space-y-3 bg-green-50 mt-4 p-4 border border-green-200 rounded-lg"
        >
          <Paragraph1 className="font-semibold text-green-900 text-sm">
            ✓ Withdrawal Request Submitted
          </Paragraph1>
          <Paragraph1 className="text-gray-700 text-xs">
            Your withdrawal request has been submitted and is pending admin
            approval. The funds will be transferred to your selected account
            once processed.
          </Paragraph1>

          {/* Withdrawal Reference Number */}
          <div className="bg-white p-3 border border-green-100 rounded-lg">
            <Paragraph1 className="mb-1 text-gray-600 text-xs">
              Reference Number
            </Paragraph1>
            <div className="flex justify-between items-center gap-2">
              <Paragraph1 className="font-mono font-bold text-gray-900 text-sm">
                {withdrawalReference}
              </Paragraph1>
              <motion.button
                onClick={() => {
                  navigator.clipboard.writeText(withdrawalReference);
                }}
                className="bg-green-100 hover:bg-green-200 px-2 py-1 rounded font-medium text-green-700 text-xs transition"
              >
                Copy
              </motion.button>
            </div>
          </div>

          {/* Withdrawal Status Section */}
          <div className="space-y-2 bg-white p-3 border border-green-100 rounded-lg">
            <Paragraph1 className="font-medium text-gray-900 text-xs">
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
                <span className="inline-block bg-amber-100 px-2 py-1 rounded font-semibold text-amber-800 text-xs">
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
            className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg w-full font-medium text-white text-xs transition"
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
          className="bg-red-50 mt-4 p-3 border border-red-200 rounded-lg"
        >
          <Paragraph1 className="text-red-700 text-xs">
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
            className="space-y-4 bg-white mt-4 p-4 border border-gray-200 rounded-lg"
          >
            <div>
              <Paragraph1 className="mb-3 font-semibold text-gray-900 text-sm">
                {accounts && accounts.length > 0 ? "Update" : "Add"} Bank
                Account
              </Paragraph1>

              {profileError && (
                <div className="bg-red-50 mb-4 p-3 border border-red-200 rounded-lg">
                  <Paragraph1 className="text-red-700 text-xs">
                    {profileError}
                  </Paragraph1>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700 text-sm">
                  Bank Name
                </label>
                <div className="relative">
                  <motion.button
                    onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                    className="flex justify-between items-center bg-white p-3 border border-gray-300 hover:border-gray-400 rounded-lg w-full text-gray-900 text-left transition"
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
                        className="top-full right-0 left-0 z-50 absolute bg-white shadow-lg mt-2 border border-gray-300 rounded-lg"
                      >
                        {/* Search Input */}
                        <div className="p-3 border-gray-200 border-b">
                          <input
                            type="text"
                            placeholder="Search banks..."
                            value={bankSearch}
                            onChange={(e) => setBankSearch(e.target.value)}
                            className="bg-white p-2 border border-gray-300 focus:border-black rounded-lg outline-none focus:ring-2 focus:ring-black w-full text-gray-900 placeholder:text-gray-400 text-sm"
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
                            <div className="px-4 py-3 text-gray-500 text-sm text-center">
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
                <label className="block mb-2 font-medium text-gray-700 text-sm">
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
                  className="bg-white p-3 border border-gray-300 focus:border-black rounded-lg outline-none focus:ring-2 focus:ring-black w-full text-gray-900 placeholder:text-gray-400"
                  placeholder="Enter 10-digit account number"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700 text-sm">
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
                  className="bg-white p-3 border border-gray-300 focus:border-black rounded-lg outline-none focus:ring-2 focus:ring-black w-full text-gray-900 placeholder:text-gray-400"
                  placeholder="Name on account"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={() => setIsUpdateProfileOpen(false)}
                className="flex-1 hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 transition"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleUpdateProfile}
                disabled={
                  updateProfileMutation.isPending ||
                  !profileFormData.bankName?.trim()
                }
                className="flex-1 bg-black hover:bg-gray-900 disabled:bg-gray-400 px-4 py-2 rounded-lg font-medium text-white transition"
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

export const WithdrawalForm = ExampleWithdrawalForm;
export default ExampleWithdrawalForm;
