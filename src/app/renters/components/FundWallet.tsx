// ENDPOINTS: GET /api/renters/profile (virtual account)

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, ArrowLeft, Copy, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import { FaPlus } from "react-icons/fa";
import { useProfile } from "@/lib/queries/renters/useProfile";
import { useVerificationsStatus } from "@/lib/queries/renters/useVerifications";
import { isRenterVerifiedForFundWallet } from "@/lib/renters/fundWalletVerification";
import VerificationModal from "@/app/shop/cart/checkout/components/VerificationModal";
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
  // Same hook + cache as Account Verifications so invalidation after verify updates this UI
  const {
    data: verificationsStatusResponse,
    isLoading: verificationsLoading,
    refetch: refetchVerificationsStatus,
  } = useVerificationsStatus();
  const verificationReady = !verificationsLoading;
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationSubmittedAt, setVerificationSubmittedAt] = useState<
    number | null
  >(null);
  const [countdown, setCountdown] = useState(0);

  // useProfile() returns the profile object directly (not { profile })
  const virtualAccount = profileResponse?.virtualAccount;

  const verifications = verificationsStatusResponse?.data?.verifications;

  const satisfiesFundWallet = useMemo(
    () =>
      isRenterVerifiedForFundWallet(profileResponse, verifications),
    [profileResponse, verifications],
  );

  // Sync verified state + modal: wait for profile; use verification status when BVN omitted from profile
  useEffect(() => {
    if (!isOpen) {
      setIsVerificationModalOpen(false);
      return;
    }
    if (isLoading || !verificationReady) return;

    setIsVerified(satisfiesFundWallet);
    if (satisfiesFundWallet) {
      setIsVerificationModalOpen(false);
    } else {
      setIsVerificationModalOpen(true);
    }
  }, [
    isOpen,
    isLoading,
    verificationReady,
    satisfiesFundWallet,
  ]);

  // Countdown timer
  useEffect(() => {
    if (!verificationSubmittedAt) return;

    const VERIFICATION_TIMEOUT = 10 * 60 * 1000; // 10 minutes
    const interval = setInterval(() => {
      const elapsed = Date.now() - verificationSubmittedAt;
      const remaining = VERIFICATION_TIMEOUT - elapsed;

      if (remaining <= 0) {
        setCountdown(0);
        clearInterval(interval);
      } else {
        setCountdown(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [verificationSubmittedAt]);

  const handleVerificationComplete = () => {
    setVerificationSubmittedAt(Date.now());
    setIsVerificationModalOpen(false);
  };

  const checkVerificationStatus = async () => {
    const VERIFICATION_TIMEOUT = 10 * 60 * 1000;
    if (countdown > 0) {
      const minutes = Math.floor(countdown / 60000);
      const seconds = Math.floor((countdown % 60000) / 1000);
      alert(
        `Please wait ${minutes}:${seconds.toString().padStart(2, "0")} before checking verification status.`,
      );
      return;
    }

    try {
      const [vRes, pRes] = await Promise.all([
        refetchVerificationsStatus(),
        refetch(),
      ]);
      const ok = isRenterVerifiedForFundWallet(
        pRes.data,
        vRes.data?.data?.verifications,
      );
      if (ok) {
        setIsVerified(true);
        setIsVerificationModalOpen(false);
        setVerificationSubmittedAt(null);
        setCountdown(0);
        toast.success("Verification successful!");
      } else {
        alert(
          "Verification is still pending. Please try again in a few moments.",
        );
      }
    } catch (err) {
      console.error("Failed to check verification status:", err);
      alert("Failed to check verification status. Please try again.");
    }
  };

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
          className="z-99 fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="top-0 right-0 fixed flex flex-col bg-white shadow-2xl px-4 w-full sm:w-114 h-screen overflow-y-auto hide-scrollbar"
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
            <div className="top-0 z-10 sticky flex justify-between items-center bg-white pt-6 pb-4 border-gray-100 border-b">
              <button
                onClick={onClose}
                className="xl:hidden p-1 rounded-full text-gray-500 hover:text-black transition"
                aria-label="Close Fund Wallet"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className="font-bold text-gray-800 uppercase tracking-widest">
                Fund your wallet
              </Paragraph1>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-500 hover:text-black transition"
                aria-label="Close Fund Wallet"
              >
                <X className="hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6 pt-6 pb-20 grow">
              {/* Verification messages */}
              {verificationSubmittedAt && countdown > 0 && (
                <div className="bg-blue-50 p-4 border border-blue-200 rounded-lg">
                  <Paragraph1 className="text-blue-700 text-xs">
                    ⏱️ Verification in progress. Please wait{" "}
                    <strong>
                      {Math.floor(countdown / 60000)}:
                      {Math.floor((countdown % 60000) / 1000)
                        .toString()
                        .padStart(2, "0")}
                    </strong>{" "}
                    to check status.
                  </Paragraph1>
                </div>
              )}

              {verificationSubmittedAt && countdown === 0 && (
                <div className="bg-amber-50 p-4 border border-amber-200 rounded-lg">
                  <Paragraph1 className="text-amber-700 text-xs">
                    ✓ Verification timer complete. Click below to check status.
                  </Paragraph1>
                </div>
              )}

              {!isVerified && !isLoading && verificationReady && (
                <div className="flex flex-col gap-4 bg-red-50 p-6 border border-red-300 rounded-lg">
                  <Paragraph1 className="font-semibold text-red-800 text-sm">
                    Verification Required
                  </Paragraph1>
                  <Paragraph1 className="text-red-700 text-xs">
                    You need to verify your identity before funding your wallet.
                    Please complete the verification process below.
                  </Paragraph1>

                  {verificationSubmittedAt && countdown === 0 && (
                    <button
                      onClick={checkVerificationStatus}
                      className="bg-black hover:bg-gray-900 px-4 py-2 rounded-lg w-full font-semibold text-white text-sm transition"
                    >
                      Check Verification Status
                    </button>
                  )}

                  {!verificationSubmittedAt && (
                    <button
                      onClick={() => setIsVerificationModalOpen(true)}
                      className="bg-black hover:bg-gray-900 px-4 py-2 rounded-lg w-full font-semibold text-white text-sm transition"
                    >
                      Verify Identity
                    </button>
                  )}
                </div>
              )}

              {isLoading && (
                <div className="flex justify-center items-center py-8">
                  <Paragraph1 className="text-gray-500">Loading...</Paragraph1>
                </div>
              )}

              {isVerified && !isLoading ? (
                <div className="space-y-6">
                  {/* Virtual Account Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 border border-blue-300 rounded-lg">
                    <Paragraph3 className="mb-4 font-semibold text-blue-900 text-sm uppercase tracking-wide">
                      Your Virtual Account
                    </Paragraph3>

                    {/* VA Number */}
                    <div className="space-y-2 mb-5">
                      <Paragraph3 className="text-blue-700 text-xs">
                        VA Number
                      </Paragraph3>
                      <div className="flex items-center gap-3 bg-white px-4 py-3 border border-blue-200 rounded-lg">
                        <input
                          type="text"
                          value={virtualAccount?.vaNumber || "N/A"}
                          readOnly
                          className="flex-1 bg-transparent outline-none font-mono font-bold text-gray-900 text-lg"
                        />
                        <button
                          onClick={() =>
                            handleCopy(virtualAccount?.vaNumber ?? "", "VA Number")
                          }
                          className="p-2 text-blue-600 hover:text-blue-800 transition"
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
                      <Paragraph3 className="text-blue-700 text-xs">
                        Bank Name
                      </Paragraph3>
                      <div className="flex items-center gap-3 bg-white px-4 py-3 border border-blue-200 rounded-lg">
                        <input
                          type="text"
                          value={virtualAccount?.bankName || "N/A"}
                          readOnly
                          className="flex-1 bg-transparent outline-none font-semibold text-gray-900 text-base"
                        />
                        <button
                          onClick={() =>
                            handleCopy(virtualAccount?.bankName ?? "", "Bank Name")
                          }
                          className="p-2 text-blue-600 hover:text-blue-800 transition"
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
                      <Paragraph3 className="text-blue-700 text-xs">
                        Status
                      </Paragraph3>
                      <div className="flex items-center bg-white px-4 py-3 border border-blue-200 rounded-lg">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            virtualAccount?.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${
                              virtualAccount?.status === "ACTIVE"
                                ? "bg-green-600"
                                : "bg-gray-400"
                            }`}
                          />
                          {virtualAccount?.status || "UNKNOWN"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-amber-50 p-4 border border-amber-300 rounded-lg">
                    <Paragraph1 className="text-amber-800 text-sm">
                      Transfer funds to this virtual account to instantly credit
                      your wallet. Use the copy buttons above for quick access.
                    </Paragraph1>
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 hover:bg-gray-50 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-black transition"
                    >
                      <Paragraph1>Cancel</Paragraph1>
                    </button>

                    <button
                      // onClick={onClose}
                      onClick={handleRefresh}
                      className="flex-1 bg-black hover:bg-gray-900 px-4 py-3 rounded-lg font-semibold text-white transition"
                    >
                      <Paragraph1>Done</Paragraph1>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 p-4 border border-red-300 rounded-lg">
                  <Paragraph1 className="text-red-800 text-sm">
                    Virtual account not found. Please contact support.
                  </Paragraph1>
                </div>
              )}
            </div>

            {/* Verification Modal */}
            <VerificationModal
              isOpen={isVerificationModalOpen}
              onClose={() => setIsVerificationModalOpen(false)}
              onVerified={handleVerificationComplete}
              currentBvn={profileResponse?.bvn || ""}
              currentNin={profileResponse?.nin}
            />
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
        className="flex flex-1 justify-center items-center space-x-2 bg-white hover:bg-gray-100 px-4 py-3 rounded-lg font-semibold text-black text-sm transition duration-150"
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
