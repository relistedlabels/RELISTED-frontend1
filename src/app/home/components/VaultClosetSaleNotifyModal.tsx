"use client";

import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { registerVaultClosetSaleInterest } from "@/lib/api/vaultClosetSale";

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
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-lg border border-white/15 bg-neutral-950 p-6 text-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold tracking-tight">
          Get sale updates
        </h2>
        <p className="mt-2 text-sm text-white/75">
          We will email you when the Vault Closet sale is live. No account
          required.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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
              className="w-full rounded border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-amber-200/60 focus:ring-1 focus:ring-amber-200/40"
              disabled={submitting}
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-white/25 px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/5"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-amber-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-amber-200 disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Notify me"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
