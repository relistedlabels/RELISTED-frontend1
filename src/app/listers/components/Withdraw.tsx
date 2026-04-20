// ENDPOINTS: PUT /api/listers/profile (bankAccountInfo → BankAccount sync), GET /api/listers/wallet/bank-accounts, POST /api/listers/wallet/withdraw, GET /api/listers/wallet

"use client";

import React, { useMemo, useState } from "react";
import { X, ChevronLeft, ArrowLeft, ChevronDown, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Paragraph2, Header3, Paragraph3 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import { FaPlus } from "react-icons/fa";
import { toast } from "sonner";
import { useWithdrawFunds } from "@/lib/mutations/listers/useWithdrawFunds";
import {
  HiOutlineArrowDownRight,
  HiOutlinePencil,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { useWalletBalance } from "@/lib/queries/listers/useWalletBalance";
import { useListerProfile } from "@/lib/queries/listers/useListerProfile";
import { useBankAccounts } from "@/lib/queries/listers/useBankAccounts";
import { useUpdateListerProfile } from "@/lib/mutations/listers/useUpdateListerProfile";
import { resolveRenterBankByName } from "@/lib/renters/renterBankOptions";
import { useNgBankOptions } from "@/lib/queries/useNgBankOptions";
import { useQueryClient } from "@tanstack/react-query";

// --------------------
// Slide-in Filter Panel
// --------------------
interface WithdrawPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// --------------------
// Withdrawal Form Component (properly defined to avoid hooks violation)
// --------------------
interface WithdrawalFormProps {
  bankAccount: any;
  onSuccess: () => void;
}

const WithdrawalForm: React.FC<WithdrawalFormProps> = ({
  bankAccount,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string>("");
  const withdrawMutation = useWithdrawFunds();

  const handleWithdraw = async () => {
    console.log("[LISTER WITHDRAWAL] Starting withdrawal process", {
      amount,
      selectedBankAccount: bankAccount?.id,
    });

    // Validation
    const parsedAmount = parseFloat(amount.replace(/,/g, ""));
    console.log("[LISTER WITHDRAWAL] Validating amount:", {
      amount,
      parsedAmount,
    });
    if (!amount || parsedAmount <= 0 || isNaN(parsedAmount)) {
      console.error("[LISTER WITHDRAWAL] Invalid amount validation failed", {
        amount,
        parsedAmount,
      });
      setError("Please enter a valid amount");
      return;
    }

    if (!bankAccount?.id) {
      console.error("[LISTER WITHDRAWAL] No bank account selected");
      setError("Please select a bank account");
      return;
    }

    console.log(
      "[LISTER WITHDRAWAL] All validations passed, submitting withdrawal",
    );
    const withdrawalData = {
      amount: parsedAmount,
      bankAccountId: bankAccount.id,
    };
    console.log(
      "[LISTER WITHDRAWAL] Submitting withdrawal request:",
      withdrawalData,
    );

    withdrawMutation.mutate(withdrawalData, {
      onSuccess: (data: any) => {
        console.log("[LISTER WITHDRAWAL] Withdrawal successful:", data);
        toast.success("Withdrawal request submitted successfully!");
        setAmount("");
        setError("");
        onSuccess();
      },
      onError: (error: any) => {
        console.error("[LISTER WITHDRAWAL] Withdrawal failed:", error);
        const errorMessage =
          error?.message || "Withdrawal failed. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Amount Input */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Paragraph1 className="font-medium text-gray-900 text-sm">
            Withdrawal Amount
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
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 p-3 border border-red-200 rounded-lg">
          <Paragraph1 className="text-red-700 text-xs">{error}</Paragraph1>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleWithdraw}
        disabled={withdrawMutation.isPending || !bankAccount?.id}
        className="bg-black hover:bg-gray-900 disabled:opacity-50 py-3 rounded-lg w-full font-semibold text-white transition"
      >
        {withdrawMutation.isPending ? "Processing..." : "Withdraw Now"}
      </button>
    </div>
  );
};

// --------------------
// Slide-in Filter Panel
// --------------------
const WithdrawPanel: React.FC<WithdrawPanelProps> = ({ isOpen, onClose }) => {
  const [isEditBankOpen, setIsEditBankOpen] = useState(false);
  const [bankName, setBankName] = useState("");
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankError, setBankError] = useState("");

  const { data: walletBalance, isLoading: walletLoading } = useWalletBalance();
  const { data: profileResponse, isLoading: profileLoading } =
    useListerProfile();
  const { data: bankListPayload, isLoading: bankListLoading } =
    useBankAccounts();
  const updateProfileMutation = useUpdateListerProfile();
  const { bankOptions } = useNgBankOptions("NG");
  const queryClient = useQueryClient();

  const filteredBanks = useMemo(
    () =>
      bankOptions.filter((bank) =>
        bank.bankName.toLowerCase().includes(bankSearchQuery.toLowerCase()),
      ),
    [bankOptions, bankSearchQuery],
  );

  const availableBalance =
    walletBalance?.data?.wallet?.balance?.availableBalance ?? 0;
  const totalBalance = walletBalance?.data?.wallet?.balance?.totalBalance ?? 0;

  const walletBankRows = bankListPayload?.bankAccounts ?? [];
  const primaryWalletBank =
    walletBankRows.find((b) => b.isDefault) ?? walletBankRows[0];
  /** Use wallet bank accounts for withdrawal - they have proper IDs for the API */
  const bankAccount = primaryWalletBank;

  // Debug bank account loading
  console.log("[LISTER BANK] Bank accounts state:", {
    bankListLoading,
    walletBankRows: walletBankRows.length,
    primaryWalletBank: primaryWalletBank
      ? {
          id: primaryWalletBank.id,
          bankName: primaryWalletBank.bankName,
          accountNumber: primaryWalletBank.accountNumber?.slice(-4),
        }
      : null,
  });

  const bankVerificationLabel = primaryWalletBank?.verificationStatus;

  const bankCardLoading = !bankAccount && bankListLoading;

  const closePanel = () => {
    setBankSearchQuery("");
    setIsBankDropdownOpen(false);
    setIsEditBankOpen(false);
    setBankName("");
    setAccountNumber("");
    setAccountName("");
    setBankError("");
    onClose();
  };

  const handleEditBank = () => {
    setBankName(bankAccount?.bankName || "");
    setAccountNumber(bankAccount?.accountNumber || "");
    setAccountName(bankAccount?.accountName || "");
    setBankSearchQuery("");
    setIsBankDropdownOpen(false);
    setBankError("");
    setIsEditBankOpen(true);
  };

  const handleSubmitBank = () => {
    console.log("[LISTER BANK] Starting bank account creation", {
      bankName,
      accountNumber,
      accountName,
    });

    setBankError("");

    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      console.error("[LISTER BANK] Validation failed: missing fields");
      setBankError("Please fill in all fields");
      return;
    }

    if (accountNumber.length < 10) {
      console.error(
        "[LISTER BANK] Validation failed: account number too short",
      );
      setBankError("Account number must be at least 10 digits");
      return;
    }

    const bankEntry = resolveRenterBankByName(bankName.trim(), bankOptions);
    if (!bankEntry) {
      console.error("[LISTER BANK] Validation failed: bank not found", {
        bankName,
      });
      setBankError(
        "Select a bank from the list so we can send a valid bank code to the server.",
      );
      return;
    }

    console.log("[LISTER BANK] Bank entry found", bankEntry);
    const payload = {
      bankAccountInfo: {
        bankName: bankEntry.bankName,
        bankCode: bankEntry.bankCode,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
      },
    };
    console.log("[LISTER BANK] Submitting payload:", payload);

    updateProfileMutation.mutate(
      {
        bankAccountInfo: {
          bankName: bankEntry.bankName,
          bankCode: bankEntry.bankCode,
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim(),
        },
      },
      {
        onSuccess: () => {
          console.log("[LISTER BANK] Bank account created successfully");
          toast.success("Bank account updated successfully!");
          setIsEditBankOpen(false);
          setBankName("");
          setAccountNumber("");
          setAccountName("");
          setBankError("");

          // Invalidate and refetch bank accounts to show the new account
          queryClient.invalidateQueries({
            queryKey: ["listers", "wallet", "bank-accounts"],
          });
          queryClient.invalidateQueries({ queryKey: ["listers", "profile"] });
        },
        onError: (error: any) => {
          console.error("[LISTER BANK] Failed to create bank account:", error);
          const errorMessage =
            error?.message || "Failed to update bank account";
          setBankError(errorMessage);
          toast.error(errorMessage);
        },
      },
    );
  };

  const variants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="z-99 fixed inset-0 bg-black/70 backdrop--blur-sm"
          onClick={closePanel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="top-0 right-0 fixed flex flex-col bg-white shadow-2xl px-4 w-full sm:w-114 h-screen overflow-y-auto text-gray-900 hide-scrollbar"
            role="dialog"
            aria-modal="true"
            aria-label="Product Withdraw"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="top-0 z-10 sticky flex justify-between items-center bg-white pt-6 pb-4 border-gray-100 border-b">
              <button
                onClick={closePanel}
                className="xl:hidden p-1 rounded-full text-gray-500 hover:text-black transition"
                aria-label="Close Withdraw"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className="font-bold text-gray-800 uppercase tracking-widest">
                WITHDRAW FUNDS{" "}
              </Paragraph1>
              <button
                onClick={closePanel}
                className="p-1 rounded-full text-gray-500 hover:text-black transition"
                aria-label="Close Withdraw"
              >
                <X className="hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6 pt-4 pb-20 grow">
              {/* Wallet Balance Card */}
              <div className="bg-gray-100 mb-6 p-4 rounded-xl">
                <Paragraph1 className="mb-1 text-gray-500 text-sm">
                  Total Balance
                </Paragraph1>
                <div className="flex items-center space-x-2">
                  <img src="/icons/lock2.png" className="w-auto h-[41px]" />

                  {walletLoading ? (
                    <div className="bg-slate-300 rounded w-32 h-8 animate-pulse" />
                  ) : walletBalance ? (
                    <div className="flex flex-col">
                      <Paragraph3 className="font-extrabold text-black text-3xl">
                        ₦{totalBalance.toLocaleString()}
                      </Paragraph3>
                      <Paragraph1 className="mt-1 text-gray-600 text-xs">
                        Available: ₦{availableBalance.toLocaleString()}
                      </Paragraph1>
                    </div>
                  ) : (
                    <Paragraph1 className="text-red-600">
                      Failed to load wallet balance
                    </Paragraph1>
                  )}
                </div>
                <Paragraph1 className="mt-2 text-gray-500 text-xs">
                  Make only 5 withdrawals per month
                </Paragraph1>
              </div>

              {/* Bank Account Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 p-4 border border-blue-200 rounded-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <HiOutlineCheckCircle className="w-5 h-5 text-blue-700" />
                    </div>
                    <Paragraph1 className="font-medium text-gray-900 text-sm">
                      Bank Account
                    </Paragraph1>
                  </div>
                  {!isEditBankOpen && (
                    <motion.button
                      onClick={() => handleEditBank()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="hover:bg-blue-100 p-2 rounded-lg transition"
                    >
                      <HiOutlinePencil className="w-4 h-4 text-blue-700" />
                    </motion.button>
                  )}
                </div>

                {bankCardLoading ? (
                  <div className="space-y-2">
                    <div className="bg-blue-200 rounded h-4 animate-pulse" />
                    <div className="bg-blue-200 rounded w-3/4 h-4 animate-pulse" />
                  </div>
                ) : isEditBankOpen ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 mt-3"
                  >
                    {bankError && (
                      <div className="bg-red-50 p-3 border border-red-200 rounded-lg">
                        <Paragraph1 className="text-red-700 text-xs">
                          {bankError}
                        </Paragraph1>
                      </div>
                    )}

                    <div>
                      <label className="block mb-1 font-medium text-gray-700 text-xs">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <motion.button
                          onClick={() =>
                            setIsBankDropdownOpen(!isBankDropdownOpen)
                          }
                          className="flex justify-between items-center bg-white px-3 py-2 border border-gray-300 hover:border-gray-400 focus:border-blue-500 rounded-lg focus:ring-blue-500 w-full text-sm text-left transition"
                        >
                          <span
                            className={
                              bankName ? "text-gray-900" : "text-gray-500"
                            }
                          >
                            {bankName || "Select a bank"}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`transform transition ${
                              isBankDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </motion.button>

                        <AnimatePresence>
                          {isBankDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              className="top-full right-0 left-0 z-20 absolute flex flex-col bg-white shadow-lg mt-1 border border-gray-300 rounded-lg max-h-48 overflow-hidden"
                            >
                              {/* Search Input */}
                              <div className="p-2 border-gray-200 border-b">
                                <input
                                  type="text"
                                  placeholder="Search banks..."
                                  value={bankSearchQuery}
                                  onChange={(e) =>
                                    setBankSearchQuery(e.target.value)
                                  }
                                  className="px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-xs"
                                  autoFocus
                                />
                              </div>

                              {/* Banks List */}
                              <div className="flex-1 overflow-y-auto">
                                {filteredBanks.length > 0 ? (
                                  filteredBanks.map((bank) => (
                                    <motion.button
                                      key={bank.bankCode}
                                      onClick={() => {
                                        setBankName(bank.bankName);
                                        setIsBankDropdownOpen(false);
                                        setBankSearchQuery("");
                                      }}
                                      className={`w-full px-3 py-2 text-sm text-left hover:bg-blue-50 transition ${
                                        bankName === bank.bankName
                                          ? "bg-blue-100 text-blue-900 font-medium"
                                          : "text-gray-700"
                                      }`}
                                      whileHover={{ paddingLeft: 16 }}
                                    >
                                      {bank.bankName}
                                    </motion.button>
                                  ))
                                ) : (
                                  <div className="px-3 py-4 text-gray-500 text-xs text-center">
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
                      <label className="block mb-1 font-medium text-gray-700 text-xs">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="10-digit account number"
                        className="bg-white px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-lg focus:ring-blue-500 w-full text-black text-sm transition"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-medium text-gray-700 text-xs">
                        Account Name
                      </label>
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Name on account"
                        className="bg-white px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-lg focus:ring-blue-500 w-full text-black text-sm transition"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <motion.button
                        onClick={() => setIsEditBankOpen(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 hover:bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 text-xs transition"
                      >
                        Cancel
                      </motion.button>
                    </div>

                    {/* Double Check Warning */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-yellow-50 mt-4 p-3 border border-yellow-200 rounded-lg"
                    >
                      <Paragraph1 className="text-yellow-800 text-xs">
                        <span className="font-semibold">️ Important:</span>{" "}
                        Please double-check your bank details are correct before
                        saving. Incorrect details may result in failed
                        withdrawals.
                      </Paragraph1>
                    </motion.div>

                    <motion.button
                      onClick={handleSubmitBank}
                      disabled={updateProfileMutation.isPending || !bankName}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 mt-4 px-3 py-2 rounded-lg w-full font-medium text-white text-xs transition disabled:cursor-not-allowed"
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save"}
                    </motion.button>
                  </motion.div>
                ) : bankAccount ? (
                  <div className="space-y-1">
                    <Paragraph1 className="font-semibold text-gray-900">
                      {bankAccount.bankName}
                    </Paragraph1>
                    <Paragraph1 className="text-gray-600 text-sm">
                      {bankAccount.accountNumber
                        .slice(-4)
                        .padStart(bankAccount.accountNumber.length, "*")}
                    </Paragraph1>
                    <Paragraph1 className="mt-1 text-gray-500 text-xs">
                      {bankAccount.accountName}
                    </Paragraph1>
                    {bankVerificationLabel ? (
                      <Paragraph1 className="bg-amber-50 mt-2 px-2 py-1 border border-amber-100 rounded text-amber-800 text-xs">
                        Bank verification: {bankVerificationLabel}
                      </Paragraph1>
                    ) : null}
                  </div>
                ) : (
                  <motion.button
                    onClick={() => handleEditBank()}
                    className="flex justify-center items-center gap-2 hover:bg-blue-100 py-2 rounded w-full text-blue-700 transition"
                  >
                    <FaPlus size={14} />
                    <Paragraph1 className="font-medium text-sm">
                      Add Bank Account
                    </Paragraph1>
                  </motion.button>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 p-4 border border-gray-200 rounded-lg"
              >
                <Paragraph1 className="font-semibold text-gray-900 text-sm">
                  Withdraw to bank
                </Paragraph1>
                <Paragraph1 className="text-gray-600 text-xs">
                  Enter an amount, pick the payout account, then submit your
                  request.
                </Paragraph1>
                <WithdrawalForm
                  bankAccount={bankAccount}
                  onSuccess={closePanel}
                />
              </motion.div>
            </div>

            {/* Footer */}
            <div className="hidden bottom-0 sticky flex- justify-between gap-4 bg-white mt-auto py-2 text-black">
              <button
                onClick={closePanel}
                className="flex-1 hover:bg-gray-50 px-4 py-3 border border-gray-300 rounded-lg font-semibold transition"
              >
                <Paragraph1>Cancel </Paragraph1>
              </button>

              <button className="flex-1 bg-black hover:bg-gray-900 px-4 py-3 border rounded-lg font-semibold text-white transition">
                <Paragraph1>Proceed </Paragraph1>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --------------------
// Main Component
// --------------------
const Withdraw: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex flex-1 justify-center items-center space-x-1 bg-[#333333] hover:bg-[#444444] px-4 py-3 rounded-lg font-semibold text-white text-sm transition duration-150"
      >
        <Paragraph1>Withdraw</Paragraph1>
        <HiOutlineArrowDownRight className="ml-1 w-4 h-4" />
      </button>

      {/* Filter Panel */}
      <WithdrawPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default Withdraw;
