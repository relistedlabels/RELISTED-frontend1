"use client";
// ENDPOINTS: GET /api/listers/wallet (wallet balance)

import type React from "react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import Withdraw from "./Withdraw";
import { useWalletBalance } from "@/lib/queries/listers/useWalletBalance";

/* ---------- Motion ---------- */

const floatingVariants = {
  animate: {
    y: [0, -12, 0],
    x: [0, 8, 0],
    rotate: [0, 4, 0],
  },
};

const baseTransition = {
  repeat: Infinity,
  ease: "easeInOut" as const,
};

/* ---------- Scatter Generator ---------- */

type BoxConfig = {
  top: string;
  left: string;
  size: number;
  z: number;
  opacityClass: string;
  duration: number;
};

function generateScatter(
  count: number,
  sizeRange: [number, number],
  z: number,
  opacityClass: string,
  durationBase: number,
): BoxConfig[] {
  const edgeBias = [5, 10, 15, 80, 85, 90]; // forces edge presence

  return Array.from({ length: count }).map((_) => {
    const useEdge = Math.random() > 0.6;

    const top = useEdge
      ? edgeBias[Math.floor(Math.random() * edgeBias.length)]
      : Math.random() * 80 + 5;

    const left = useEdge
      ? edgeBias[Math.floor(Math.random() * edgeBias.length)]
      : Math.random() * 85 + 5;

    return {
      top: `${top}%`,
      left: `${left}%`,
      size:
        sizeRange[0] +
        Math.floor(Math.random() * (sizeRange[1] - sizeRange[0])),
      z,
      opacityClass,
      duration: durationBase + Math.random() * 2,
    };
  });
}

/* ---------- Component ---------- */

const WalletBalanceCard: React.FC = () => {
  const { data: walletData, isLoading } = useWalletBalance();

  const boxes = useMemo(() => {
    return [
      // FRONT – 5
      ...generateScatter(
        5,
        [60, 80],
        30,
        "bg-white/12 border border-white/10",
        4.5,
      ),

      // MID – 5 (behind)
      ...generateScatter(5, [80, 100], 20, "bg-white/6", 6),

      // BACK – 5 (darker, far back)
      ...generateScatter(5, [100, 130], 10, "bg-black/40", 7.5),
    ];
  }, []);

  const totalBalance = walletData?.data?.wallet?.balance?.totalBalance ?? 0;
  const availableBalance =
    walletData?.data?.wallet?.balance?.availableBalance ?? 0;

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const displayTotalBalance = `₦${formatCurrency(totalBalance)}`;
  const displayAvailableBalance = `₦${formatCurrency(availableBalance)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full h-[240px] bg-[#1E1B1B] rounded-xl overflow-hidden p-8 flex flex-col justify-between shadow-lg"
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        {boxes.map((box, i) => (
          <motion.div
            key={i}
            variants={floatingVariants}
            animate="animate"
            transition={{
              ...baseTransition,
              duration: box.duration,
            }}
            className={`absolute rounded-lg ${box.opacityClass}`}
            style={{
              top: box.top,
              left: box.left,
              width: box.size,
              height: box.size,
              zIndex: box.z,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-40 space-y-3">
        <div>
          <Paragraph1 className="text-xs text-gray-400 mb-1">
            Total Balance
          </Paragraph1>
          {isLoading ? (
            <div className="h-8 bg-gray-700 rounded w-1/2 animate-pulse" />
          ) : (
            <Paragraph2 className="font-bold text-white text-2xl">
              {displayTotalBalance}
            </Paragraph2>
          )}
        </div>

        <div>
          <Paragraph1 className="text-xs text-gray-400 mb-1">
            Available Balance
          </Paragraph1>
          {isLoading ? (
            <div className="h-6 bg-gray-700 rounded w-1/3 animate-pulse" />
          ) : (
            <Paragraph1 className="font-semibold text-gray-300">
              {displayAvailableBalance}
            </Paragraph1>
          )}
        </div>
      </div>
      <div className="relative z-40 pt-4">
        <Withdraw />
      </div>
    </motion.div>
  );
};

export default WalletBalanceCard;
