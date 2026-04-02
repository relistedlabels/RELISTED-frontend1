// ENDPOINTS: PUT /api/renters/profile (bankAccountInfo → BankAccount sync), GET /api/renters/wallet/bank-accounts, POST /api/renters/wallet/withdraw, GET /api/renters/wallet

"use client";

import React, { useMemo, useState } from "react";
import {
  SlidersVertical,
  X,
  Search,
  ChevronLeft,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Paragraph2, Header3, Paragraph3 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import WalletTopUpForm from "@/app/shop/cart/checkout/components/WalletTopUpForm";
import { FaPlus } from "react-icons/fa";
import { WithdrawalForm } from "./UserWalletWithdraw";
import {
  HiOutlineArrowDownRight,
  HiOutlinePencil,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { useWallet } from "@/lib/queries/renters/useWallet";
import { useProfile } from "@/lib/queries/renters/useProfile";
import { useBankAccounts } from "@/lib/queries/renters/useBankAccounts";
import { useUpdateProfile } from "@/lib/mutations/renters/useProfileMutations";
import { resolveRenterBankByName } from "@/lib/renters/renterBankOptions";
import { useNgBankOptions } from "@/lib/queries/useNgBankOptions";

// --------------------
// Slide-in Filter Panel
// --------------------
interface WithdrawPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const WithdrawPanel: React.FC<WithdrawPanelProps> = ({ isOpen, onClose }) => {
  const [isEditBankOpen, setIsEditBankOpen] = useState(false);
  const [bankName, setBankName] = useState("");
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankError, setBankError] = useState("");

  const { data: walletResponse, isLoading: walletLoading } = useWallet();
  const { data: profileResponse, isLoading: profileLoading } = useProfile();
  const { data: bankListPayload, isLoading: bankListLoading } = useBankAccounts();
  const updateProfileMutation = useUpdateProfile();
  const { bankOptions } = useNgBankOptions("NG");

  const filteredBanks = useMemo(
    () =>
      bankOptions.filter((bank) =>
        bank.bankName.toLowerCase().includes(bankSearchQuery.toLowerCase()),
      ),
    [bankOptions, bankSearchQuery],
  );

  const wallet = walletResponse?.wallet;
  const walletBalance = wallet?.balance?.totalBalance ?? 0;
  const availableBalance = wallet?.balance?.availableBalance ?? 0;

  const walletBankRows = bankListPayload?.bankAccounts ?? [];
  const primaryWalletBank =
    walletBankRows.find((b) => b.isDefault) ?? walletBankRows[0];
  /** Profile often omits bank; payout rows live on GET wallet/bank-accounts. */
  const bankAccount =
    profileResponse?.bankAccount ??
    (primaryWalletBank
      ? {
          bankName: primaryWalletBank.bankName,
          accountNumber: primaryWalletBank.accountNumber,
          accountName: primaryWalletBank.accountName,
        }
      : null);

  const bankVerificationLabel = primaryWalletBank?.verificationStatus;

  const bankCardLoading =
    !bankAccount && (profileLoading || bankListLoading);

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
    setBankError("");

    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      setBankError("Please fill in all fields");
      return;
    }

    if (accountNumber.length < 10) {
      setBankError("Account number must be at least 10 digits");
      return;
    }

    const bankEntry = resolveRenterBankByName(bankName.trim(), bankOptions);
    if (!bankEntry) {
      setBankError(
        "Select a bank from the list so we can send a valid bank code to the server.",
      );
      return;
    }

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
          setIsEditBankOpen(false);
          setBankName("");
          setAccountNumber("");
          setAccountName("");
        },
        onError: () => {
          setBankError("Failed to update bank account");
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
          className="fixed inset-0 z-99 bg-black/70 backdrop--blur-sm"
          onClick={closePanel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed top-0 right-0 h-screen hide-scrollbar overflow-y-auto bg-white text-gray-900 shadow-2xl px-4 flex flex-col w-full sm:w-114"
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
            <div className="flex justify-between sticky top-0 items-center pb-4 border-b border-gray-100 pt-6 z-10  bg-white">
              <button
                onClick={closePanel}
                className="text-gray-500 xl:hidden hover:text-black p-1 rounded-full transition"
                aria-label="Close Withdraw"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className=" uppercase font-bold tracking-widest text-gray-800">
                WITHDRAW FUNDS{" "}
              </Paragraph1>
              <button
                onClick={closePanel}
                className="text-gray-500  hover:text-black p-1 rounded-full transition"
                aria-label="Close Withdraw"
              >
                <X className=" hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="grow pt-4 pb-20 space-y-6">
              {/* Wallet Balance Card */}

              {/* Available Balance Display */}
              <div className="p-4 bg-gray-100 rounded-xl mb-6">
                <Paragraph1 className="text-sm text-gray-500 mb-1">
                  Total Balance
                </Paragraph1>
                <div className="flex items-center space-x-2">
                  <img src="/icons/lock2.png" className="h-[41px] w-auto" />

                  {walletLoading ? (
                    <div className="h-8 w-32 bg-slate-300 rounded animate-pulse" />
                  ) : wallet ? (
                    <div className="flex flex-col">
                      <Paragraph3 className="text-3xl text-black font-extrabold">
                        ₦{walletBalance.toLocaleString()}
                      </Paragraph3>
                      <Paragraph1 className="text-xs text-gray-600 mt-1">
                        Available: ₦{availableBalance.toLocaleString()}
                      </Paragraph1>
                    </div>
                  ) : (
                    <Paragraph1 className="text-red-600">
                      Failed to load wallet balance
                    </Paragraph1>
                  )}
                </div>
                <Paragraph1 className="text-xs text-gray-500 mt-2">
                  Make only 5 withdrawals per month
                </Paragraph1>
              </div>

              {/* Bank Account Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <HiOutlineCheckCircle className="w-5 h-5 text-blue-700" />
                    </div>
                    <Paragraph1 className="text-sm font-medium text-gray-900">
                      Bank Account
                    </Paragraph1>
                  </div>
                  {!isEditBankOpen && (
                    <motion.button
                      onClick={() => handleEditBank()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 hover:bg-blue-100 rounded-lg transition"
                    >
                      <HiOutlinePencil className="w-4 h-4 text-blue-700" />
                    </motion.button>
                  )}
                </div>

                {bankCardLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-blue-200 rounded animate-pulse" />
                    <div className="h-4 bg-blue-200 rounded animate-pulse w-3/4" />
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
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <Paragraph1 className="text-xs text-red-700">
                          {bankError}
                        </Paragraph1>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <motion.button
                          onClick={() =>
                            setIsBankDropdownOpen(!isBankDropdownOpen)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition bg-white text-left flex items-center justify-between hover:border-gray-400"
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
                              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-48 overflow-hidden flex flex-col"
                            >
                              {/* Search Input */}
                              <div className="p-2 border-b border-gray-200">
                                <input
                                  type="text"
                                  placeholder="Search banks..."
                                  value={bankSearchQuery}
                                  onChange={(e) =>
                                    setBankSearchQuery(e.target.value)
                                  }
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                />
                              </div>

                              {/* Banks List */}
                              <div className="overflow-y-auto flex-1">
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
                                  <div className="px-3 py-4 text-center text-xs text-gray-500">
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
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="10-digit account number"
                        className="w-full px-3 py-2 text-sm border bg-white text-black border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Account Name
                      </label>
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Name on account"
                        className="w-full px-3 py-2 text-sm bg-white text-black border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <motion.button
                        onClick={() => setIsEditBankOpen(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-3 py-2 text-xs font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                      >
                        Cancel
                      </motion.button>
                    </div>

                    {/* Double Check Warning */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4"
                    >
                      <Paragraph1 className="text-xs text-yellow-800">
                        <span className="font-semibold">⚠️ Important:</span>{" "}
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
                      className="w-full mt-4 px-3 py-2 text-xs font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save"}
                    </motion.button>
                  </motion.div>
                ) : bankAccount ? (
                  <div className="space-y-1">
                    <Paragraph1 className="font-semibold text-gray-900">
                      {bankAccount.bankName}
                    </Paragraph1>
                    <Paragraph1 className="text-sm text-gray-600">
                      {bankAccount.accountNumber
                        .slice(-4)
                        .padStart(bankAccount.accountNumber.length, "*")}
                    </Paragraph1>
                    <Paragraph1 className="text-xs text-gray-500 mt-1">
                      {bankAccount.accountName}
                    </Paragraph1>
                    {bankVerificationLabel ? (
                      <Paragraph1 className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded px-2 py-1 mt-2">
                        Bank verification: {bankVerificationLabel}
                      </Paragraph1>
                    ) : null}
                  </div>
                ) : (
                  <motion.button
                    onClick={() => handleEditBank()}
                    className="w-full flex items-center justify-center gap-2 py-2 text-blue-700 hover:bg-blue-100 rounded transition"
                  >
                    <FaPlus size={14} />
                    <Paragraph1 className="text-sm font-medium">
                      Add Bank Account
                    </Paragraph1>
                  </motion.button>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4 space-y-2"
              >
                <Paragraph1 className="text-sm font-semibold text-gray-900">
                  Withdraw to bank
                </Paragraph1>
                <Paragraph1 className="text-xs text-gray-600">
                  Enter an amount, pick the payout account, then submit your
                  request.
                </Paragraph1>
                <WithdrawalForm
                  hideBalanceCard
                  onWithdrawSuccess={closePanel}
                />
              </motion.div>
            </div>

            {/* Footer */}
            <div className="mt-auto hidden py-2 text-black bg-white flex- justify-between gap-4 sticky bottom-0">
              <button
                onClick={closePanel}
                className="flex-1  px-4 py-3  font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Paragraph1>Cancel </Paragraph1>
              </button>

              <button className="flex-1  px-4 py-3  font-semibold border bg-black text-white rounded-lg hover:bg-gray-900 transition">
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
        className="flex-1 px-4 py-3 flex items-center justify-center space-x-1 text-sm font-semibold bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition duration-150"
      >
        <Paragraph1>Withdraw</Paragraph1>
        <HiOutlineArrowDownRight className="w-4 h-4 ml-1" />
      </button>

      {/* Filter Panel */}
      <WithdrawPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default Withdraw;
