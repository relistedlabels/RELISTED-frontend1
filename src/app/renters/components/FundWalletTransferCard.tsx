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
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3.5">
        <Paragraph1 className="text-sm font-semibold text-gray-900">
          Transfer to fund wallet
        </Paragraph1>
        <Paragraph1 className="mt-0.5 text-xs text-gray-500">
          Send from any Nigerian bank. Use the details below.
        </Paragraph1>
      </div>

      <div className="space-y-3 p-4">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1E1B1B]">
          <div className="border-b border-white/10 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Paragraph1 className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Account number
                </Paragraph1>
                <Paragraph1 className="mt-1 break-all font-mono text-[1.35rem] font-bold leading-tight tracking-wide text-white">
                  {accountNumber}
                </Paragraph1>
              </div>
              <button
                type="button"
                onClick={() => void copyText(accountNumber, "account")}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
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

          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <Building2 size={16} className="text-gray-300" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <Paragraph1 className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Bank
                </Paragraph1>
                <Paragraph1 className="text-sm font-semibold text-white">
                  {bankName}
                </Paragraph1>
              </div>
              <button
                type="button"
                onClick={() => void copyText(bankName, "bank")}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
              >
                {copiedField === "bank" ? (
                  <Check size={14} aria-hidden />
                ) : (
                  <Copy size={14} aria-hidden />
                )}
                Copy
              </button>
            </div>
          </div>
        </div>

        <Paragraph1 className="text-center text-xs leading-relaxed text-gray-500">
          Your wallet balance updates after the transfer clears.
        </Paragraph1>
      </div>
    </div>
  );
}
