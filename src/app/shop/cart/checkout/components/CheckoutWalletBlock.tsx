"use client";

import { Wallet } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useWallet } from "@/lib/queries/renters/useWallet";
import FundWallet from "./FundWallet";

const formatCurrency = (amount: number): string =>
  amount.toLocaleString("en-NG");

type CheckoutWalletBlockProps = {
  checkoutGrandTotalNgN?: number;
};

export default function CheckoutWalletBlock({
  checkoutGrandTotalNgN,
}: CheckoutWalletBlockProps) {
  const { data: walletResponse } = useWallet();
  const availableBalance =
    walletResponse?.wallet?.balance?.availableBalance ?? 0;
  const walletTopUpNgN =
    checkoutGrandTotalNgN !== undefined
      ? Math.max(0, Math.round(checkoutGrandTotalNgN - availableBalance))
      : undefined;
  const isWalletFunded = walletTopUpNgN !== undefined && walletTopUpNgN <= 0;

  return (
    <div className="space-y-3 my-6 py-5 border-gray-200 border-y">
      <div className="flex justify-between items-center gap-3">
        <div className="flex flex-1 items-center gap-3 min-w-0">
          <span className="flex justify-center items-center bg-gray-100 rounded-full w-10 h-10 shrink-0">
            <Wallet size={18} className="text-gray-700" />
          </span>
          <div className="min-w-0">
            <Paragraph1 className="text-gray-500 text-xs">
              Wallet balance
            </Paragraph1>
            <Paragraph1
              className={`font-bold text-lg leading-tight ${
                isWalletFunded ? "text-gray-900" : "text-red-600"
              }`}
            >
              ₦{formatCurrency(availableBalance)}
            </Paragraph1>
          </div>
        </div>
        <FundWallet />
      </div>
      {walletTopUpNgN !== undefined && walletTopUpNgN > 0 ? (
        <Paragraph1 className="bg-amber-50 px-3 py-2 border border-amber-100 rounded-lg text-amber-900 text-xs leading-relaxed">
          Add ₦{formatCurrency(walletTopUpNgN)} to your wallet to complete this
          order.
        </Paragraph1>
      ) : null}
    </div>
  );
}
