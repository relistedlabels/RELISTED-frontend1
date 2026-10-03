// ENDPOINTS: GET /api/renters/profile (virtual account)

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  slidePanelBackdrop,
  slidePanelHeader,
  slidePanelSheet,
  slidePanelTitle,
} from "@/common/ui/dashboardClasses";
import { Paragraph1 } from "@/common/ui/Text";
import { FaPlus } from "react-icons/fa";
import WalletTopUpForm from "@/app/shop/cart/checkout/components/WalletTopUpForm";
import {
  buildOnboardingTaskUrl,
  renterWalletOnboardingTask,
} from "@/lib/onboarding/onboardingTasks";

interface FundWalletPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FundWalletPanel: React.FC<FundWalletPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const searchParams = useSearchParams();
  const onboardingOverlayZ = searchParams.get("onboardingTask")
    ? "z-[130]"
    : "z-99";

  const variants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className={`${onboardingOverlayZ} ${slidePanelBackdrop}`}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={slidePanelSheet}
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
            <div className={slidePanelHeader}>
              <button
                onClick={onClose}
                className="xl:hidden p-1 rounded-full text-gray-500 hover:text-black transition"
                aria-label="Close Fund Wallet"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className={slidePanelTitle}>Fund your wallet</Paragraph1>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-500 hover:text-black transition"
                aria-label="Close Fund Wallet"
              >
                <X className="hidden xl:flex" size={20} />
              </button>
            </div>

            <div
              className="space-y-6 pt-6 pb-20 px-4 sm:px-6 grow"
              data-onboarding-target="renter-fund-wallet-details"
            >
              <WalletTopUpForm isActive={isOpen} />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

const FundWallet: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const onboardingTask = searchParams.get("onboardingTask");
  const taskStep = searchParams.get("taskStep");
  const isFundWalletTourStep =
    onboardingTask === "renter-wallet" && taskStep === "1";
  const [isOpen, setIsOpen] = useState(isFundWalletTourStep);

  useEffect(() => {
    if (isFundWalletTourStep) {
      setIsOpen(true);
    }
  }, [isFundWalletTourStep]);

  useEffect(() => {
    if (onboardingTask === "renter-wallet" && taskStep === "2") {
      setIsOpen(false);
    }
  }, [onboardingTask, taskStep]);

  const handleFundWalletClick = () => {
    setIsOpen(true);

    if (onboardingTask === "renter-wallet" && taskStep === "0") {
      router.replace(buildOnboardingTaskUrl(renterWalletOnboardingTask, 1));
    }
  };

  return (
    <>
      <button
        type="button"
        data-onboarding-target="renter-fund-wallet-button"
        onClick={handleFundWalletClick}
        className="flex flex-1 justify-center items-center space-x-2 bg-white hover:bg-gray-100 px-4 py-3 rounded-lg font-semibold text-black text-sm transition duration-150"
      >
        <FaPlus className="w-4 h-4" />
        <Paragraph1>Fund Wallet</Paragraph1>
      </button>

      <FundWalletPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default FundWallet;
