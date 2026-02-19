// ENDPOINTS: POST /api/renters/wallet/deposit

"use client";

import React, { useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import WalletTopUpForm from "@/app/shop/cart/checkout/components/WalletTopUpForm";
import { FaPlus } from "react-icons/fa";
import { useDepositFunds } from "@/lib/mutations/renters/useWalletMutations";

// --------------------
// Slide-in Filter Panel
// --------------------
interface FundWalletPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FundWalletPanel: React.FC<FundWalletPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [amount, setAmount] = useState(50000);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const depositMutation = useDepositFunds();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    depositMutation.mutate({
      amount,
      paymentMethod,
    });
  };

  const variants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-99 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed top-0 right-0 h-screen hide-scrollbar overflow-y-auto bg-white shadow-2xl px-4 flex flex-col w-full sm:w-114"
            role="dialog"
            aria-modal="true"
            aria-label="Fund Wallet"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between sticky top-0 items-center pb-4 border-b border-gray-100 pt-6 z-10 bg-white">
              <button
                onClick={onClose}
                className="text-gray-500 xl:hidden hover:text-black p-1 rounded-full transition"
                aria-label="Close Fund Wallet"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className="uppercase font-bold tracking-widest text-gray-800">
                Fund your wallet
              </Paragraph1>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-black p-1 rounded-full transition"
                aria-label="Close Fund Wallet"
              >
                <X className="hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="grow pt-4 pb-20 space-y-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Deposit
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-600">
                      ₦
                    </span>
                    <input
                      type="number"
                      min="1000"
                      max="5000000"
                      value={amount}
                      onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  <Paragraph1 className="text-xs text-gray-500 mt-2">
                    Minimum: ₦1,000 | Maximum: ₦5,000,000
                  </Paragraph1>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Debit Card</option>
                    <option value="ussd">USSD Transfer</option>
                  </select>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <Paragraph1 className="text-sm text-blue-800">
                    Funds will be credited to your wallet immediately after
                    successful payment confirmation.
                  </Paragraph1>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Paragraph1>Cancel</Paragraph1>
                  </button>

                  <button
                    type="submit"
                    disabled={depositMutation.isPending}
                    className="flex-1 px-4 py-3 font-semibold bg-black text-white rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
                  >
                    <Paragraph1>
                      {depositMutation.isPending ? "Processing..." : "Proceed"}
                    </Paragraph1>
                  </button>
                </div>

                {/* Error Message */}
                {depositMutation.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <Paragraph1 className="text-sm text-red-800">
                      {(depositMutation.error as any)?.message ||
                        "An error occurred. Please try again."}
                    </Paragraph1>
                  </div>
                )}

                {/* Success Message */}
                {depositMutation.isSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <Paragraph1 className="text-sm text-green-800">
                      Deposit request submitted successfully! You will be
                      redirected to complete payment.
                    </Paragraph1>
                  </div>
                )}
              </form>
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
const FundWallet: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex-1 px-4 py-3 flex items-center justify-center space-x-2 text-sm font-semibold bg-white text-black rounded-lg hover:bg-gray-100 transition duration-150"
      >
        <FaPlus className="w-4 h-4" />
        <Paragraph1>Fund Wallet</Paragraph1>
      </button>

      {/* Fund Wallet Panel */}
      <FundWalletPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default FundWallet;
