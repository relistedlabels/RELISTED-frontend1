"use client";

import React, { useState, useEffect } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { CreditCard, User, Loader2 } from "lucide-react";
import { useProfileStore } from "@/store/useProfileStore";
import { useRouter } from "next/navigation";
import { useCreateProfile } from "@/lib/mutations";
import { BankSelect } from "./BankSelect";

interface StepFourPaymentProps {
  onBack: () => void;
}

const StepFourPayment: React.FC<StepFourPaymentProps> = ({ onBack }) => {
  const bankAccounts = useProfileStore((s) => s.bankAccounts);
  const setProfile = useProfileStore((s) => s.setProfile);

  const [bankName, setBankName] = useState(bankAccounts.bankName);
  const [accountNumber, setAccountNumber] = useState(
    bankAccounts.accountNumber,
  );
  const [nameOnAccount, setNameOnAccount] = useState(
    bankAccounts.nameOfAccount,
  );
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const createProfile = useCreateProfile();
  const isLoading = createProfile.isPending;

  useEffect(() => {
    setBankName(bankAccounts.bankName || "");
    setAccountNumber(bankAccounts.accountNumber || "");
    setNameOnAccount(bankAccounts.nameOfAccount || "");
  }, [
    bankAccounts.bankName,
    bankAccounts.accountNumber,
    bankAccounts.nameOfAccount,
  ]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!bankName || !accountNumber || !nameOnAccount) {
      setError("Please complete all required fields before submitting.");
      return;
    }

    if (accountNumber.length < 10) {
      setError("Account number must be at least 10 digits.");
      return;
    }

    setError(null);

    setProfile({
      bankAccounts: {
        bankName,
        accountNumber,
        nameOfAccount: nameOnAccount,
      },
    });

    createProfile.mutate(undefined, {
      onSuccess: () => {
        router.replace("/listers/inventory");
      },
    });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <BankSelect value={bankName} onChange={setBankName} />

      <div>
        <label className="block mb-2">
          <Paragraph1 className="text-sm font-medium text-gray-800">
            Account Number
          </Paragraph1>
        </label>
        <div className="relative">
          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={accountNumber}
            onChange={(e) =>
              setAccountNumber(e.target.value.replace(/\D/g, ""))
            }
            maxLength={12}
            className="w-full p-4 pl-12 border rounded-lg"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block mb-2">
          <Paragraph1 className="text-sm font-medium text-gray-800">
            Name on Account
          </Paragraph1>
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={nameOnAccount}
            onChange={(e) => setNameOnAccount(e.target.value)}
            className="w-full p-4 pl-12 border rounded-lg"
            disabled={isLoading}
          />
        </div>
      </div>

      {error && (
        <Paragraph1 className="text-sm text-red-600 text-center">
          {error}
        </Paragraph1>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="w-1/2 py-3 border rounded-lg"
        >
          <Paragraph1>Previous</Paragraph1>
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-1/2 py-3 rounded-lg text-white flex items-center justify-center gap-2 ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
          }`}
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <Paragraph1>{isLoading ? "Submitting..." : "Submit"}</Paragraph1>
        </button>
      </div>
    </form>
  );
};

export default StepFourPayment;
