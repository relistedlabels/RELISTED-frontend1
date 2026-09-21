"use client";

import { Building2, Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Paragraph1 } from "@/common/ui/Text";

type FundWalletTransferCardProps = {
  bankName: string;
  accountNumber: string;
};

export default function FundWalletTransferCard({
  bankName,
  accountNumber,
}: FundWalletTransferCardProps) {
  const [copiedField, setCopiedField] = useState<"account" | "bank" | null>(
    null,
  );

  const copyText = async (text: string, field: "account" | "bank") => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied");
    window.setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="overflow-hidden border border-gray-200 rounded-2xl bg-white shadow-sm">
      <div className="px-4 py-3.5 border-gray-100 border-b bg-gray-50/80">
        <Paragraph1 className="font-semibold text-gray-900 text-sm">
          Transfer to fund wallet
        </Paragraph1>
        <Paragraph1 className="mt-0.5 text-gray-500 text-xs">
          Send from any Nigerian bank. Use the details below.
        </Paragraph1>
      </div>

      <div className="space-y-4 p-4">
        <div className="bg-gray-900 px-4 py-4 rounded-xl text-white">
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0 flex-1">
              <Paragraph1 className="font-medium text-gray-400 text-[11px] uppercase tracking-wider">
                Account number
              </Paragraph1>
              <Paragraph1 className="mt-1 font-mono font-bold text-[1.35rem] tracking-wide break-all leading-tight">
                {accountNumber}
              </Paragraph1>
            </div>
            <button
              type="button"
              onClick={() => void copyText(accountNumber, "account")}
              className="inline-flex shrink-0 items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg text-white text-xs font-medium transition-colors"
            >
              {copiedField === "account" ? (
                <Check size={14} aria-hidden />
              ) : (
                <Copy size={14} aria-hidden />
              )}
              Copy
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 px-3 py-3 border border-gray-100 rounded-xl">
          <span className="flex justify-center items-center bg-white border border-gray-200 rounded-full w-9 h-9 shrink-0">
            <Building2 size={16} className="text-gray-600" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <Paragraph1 className="text-gray-500 text-[11px] uppercase tracking-wide">
              Bank
            </Paragraph1>
            <Paragraph1 className="font-semibold text-gray-900 text-sm">
              {bankName}
            </Paragraph1>
          </div>
          <button
            type="button"
            onClick={() => void copyText(bankName, "bank")}
            className="inline-flex shrink-0 items-center gap-1.5 hover:bg-white px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-700 text-xs font-medium transition-colors"
          >
            {copiedField === "bank" ? (
              <Check size={14} className="text-green-600" aria-hidden />
            ) : (
              <Copy size={14} aria-hidden />
            )}
            Copy
          </button>
        </div>

        <Paragraph1 className="text-center text-gray-500 text-xs leading-relaxed">
          Your wallet balance updates after the transfer clears.
        </Paragraph1>
      </div>
    </div>
  );
}
