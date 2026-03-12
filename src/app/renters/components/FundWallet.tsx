// ENDPOINTS: GET /api/renters/profile (virtual account)

"use client";

import React, { useState } from "react";
import { X, ArrowLeft, Copy, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import { FaPlus } from "react-icons/fa";
import { useProfile } from "@/lib/queries/renters/useProfile";
import { toast } from "sonner";

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
  const { data: profileResponse, isLoading, refetch } = useProfile();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const virtualAccount = profileResponse?.profile?.virtualAccount;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRefresh = () => {
    window.location.reload();
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
            <div className="grow pt-6 pb-20 space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Paragraph1 className="text-gray-500">
                    Loading virtual account...
                  </Paragraph1>
                </div>
              ) : virtualAccount ? (
                <div className="space-y-6">
                  {/* Virtual Account Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-6">
                    <Paragraph3 className="text-sm font-semibold text-blue-900 mb-4 uppercase tracking-wide">
                      Your Virtual Account
                    </Paragraph3>

                    {/* VA Number */}
                    <div className="space-y-2 mb-5">
                      <Paragraph3 className="text-xs text-blue-700">
                        VA Number
                      </Paragraph3>
                      <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-blue-200">
                        <input
                          type="text"
                          value={virtualAccount.vaNumber || "N/A"}
                          readOnly
                          className="flex-1 bg-transparent text-lg font-mono font-bold text-gray-900 outline-none"
                        />
                        <button
                          onClick={() =>
                            handleCopy(virtualAccount.vaNumber, "VA Number")
                          }
                          className="text-blue-600 hover:text-blue-800 transition p-2"
                          title="Copy VA Number"
                        >
                          <Copy
                            size={18}
                            className={
                              copiedField === "VA Number"
                                ? "text-green-600"
                                : ""
                            }
                          />
                        </button>
                      </div>
                    </div>

                    {/* Bank Name */}
                    <div className="space-y-2 mb-5">
                      <Paragraph3 className="text-xs text-blue-700">
                        Bank Name
                      </Paragraph3>
                      <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-blue-200">
                        <input
                          type="text"
                          value={virtualAccount.bankName || "N/A"}
                          readOnly
                          className="flex-1 bg-transparent text-base font-semibold text-gray-900 outline-none"
                        />
                        <button
                          onClick={() =>
                            handleCopy(virtualAccount.bankName, "Bank Name")
                          }
                          className="text-blue-600 hover:text-blue-800 transition p-2"
                          title="Copy Bank Name"
                        >
                          <Copy
                            size={18}
                            className={
                              copiedField === "Bank Name"
                                ? "text-green-600"
                                : ""
                            }
                          />
                        </button>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <Paragraph3 className="text-xs text-blue-700">
                        Status
                      </Paragraph3>
                      <div className="bg-white rounded-lg px-4 py-3 border border-blue-200 flex items-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            virtualAccount.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${
                              virtualAccount.status === "ACTIVE"
                                ? "bg-green-600"
                                : "bg-gray-400"
                            }`}
                          />
                          {virtualAccount.status || "UNKNOWN"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                    <Paragraph1 className="text-sm text-amber-800">
                      Transfer funds to this virtual account to instantly credit
                      your wallet. Use the copy buttons above for quick access.
                    </Paragraph1>
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-3 font-semibold border text-black border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Paragraph1>Cancel</Paragraph1>
                    </button>

                    <button
                      // onClick={onClose}
                      onClick={handleRefresh}
                      className="flex-1 px-4 py-3 font-semibold bg-black text-white rounded-lg hover:bg-gray-900 transition"
                    >
                      <Paragraph1>Done</Paragraph1>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                  <Paragraph1 className="text-sm text-red-800">
                    Virtual account not found. Please contact support.
                  </Paragraph1>
                </div>
              )}
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
