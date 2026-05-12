"use client";

import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { registerVaultClosetSaleInterest } from "@/lib/api/vaultClosetSale";
import { Paragraph1 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultEmail?: string;
};

export default function VaultClosetSaleNotifyModal({
  open,
  onClose,
  defaultEmail = "",
}: Props) {
  const titleId = useId();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail(defaultEmail);
    }
  }, [open, defaultEmail]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Please enter your email.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await registerVaultClosetSaleInterest(trimmed);
      toast.success(res.message);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="z-200 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-[2px] p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative bg-white shadow-2xl p-6 sm:p-8 border border-black/10 rounded-md w-full max-w-md"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-3">
          <h2
            id={titleId}
            className="flex-1 min-w-0 font-semibold text-[17px] text-black leading-snug tracking-tight"
          >
            Get sale updates
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-black/5 -m-1 p-1 rounded text-black/50 hover:text-black transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>
        <Paragraph1 className="mt-2 text-black/70">
          We will email you when the Vault Closet sale is live. No account
          required.
        </Paragraph1>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label htmlFor="vault-sale-email" className="sr-only">
              Email
            </label>
            <input
              id="vault-sale-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-white px-3 py-2.5 border border-black/15 focus:border-black outline-none focus:ring-1 focus:ring-black/20 w-full text-[13px] text-black placeholder:text-black/40 transition-shadow"
              disabled={submitting}
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <Button
              type="button"
              text="Cancel"
              onClick={onClose}
              simpleHover
              disabled={submitting}
              backgroundColor="bg-white"
              color="text-black"
              border="border border-black/20"
              additionalClasses="hover:bg-black hover:text-white"
            />
            <Button
              type="submit"
              text={submitting ? "Sending…" : "Notify me"}
              simpleHover
              disabled={submitting}
              backgroundColor="bg-black"
              color="text-white"
              border="border border-black"
              additionalClasses="disabled:cursor-not-allowed disabled:opacity-50 hover:bg-neutral-800"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
