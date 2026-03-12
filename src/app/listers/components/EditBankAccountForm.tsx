"use client";
// ENDPOINTS: GET /api/banks (list of available banks), PUT /api/listers/wallet/bank-accounts/:id (update account)
import React, { useState, useEffect } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineChevronDown } from "react-icons/hi2";
import { useBanks } from "@/lib/queries/listers/useBanks";
import { useUpdateBankAccount } from "@/lib/mutations/listers/useUpdateBankAccount";

interface EditBankAccountFormProps {
  account: {
    id: string;
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  onSuccess?: () => void;
}

const EditBankAccountForm: React.FC<EditBankAccountFormProps> = ({
  account,
  onSuccess,
}) => {
  const [selectedBank, setSelectedBank] = useState(account.bankCode);
  const [accountNumber, setAccountNumber] = useState(account.accountNumber);
  const [accountName, setAccountName] = useState(account.accountName);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { data: banksData, isLoading: isLoadingBanks } = useBanks("NG");
  const updateBankMutation = useUpdateBankAccount();

  const banks = banksData?.data || [];

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    // Validation
    if (!selectedBank) {
      setError("Please select a bank");
      return;
    }
    if (!accountNumber || accountNumber.length < 10) {
      setError("Please enter a valid account number (at least 10 digits)");
      return;
    }
    if (!accountName || accountName.length < 2) {
      setError("Please enter the account name");
      return;
    }

    // Submit
    updateBankMutation.mutate({
      id: account.id,
      bankCode: selectedBank,
      accountNumber,
      accountName,
      accountType: "savings",
    });
  };

  useEffect(() => {
    if (updateBankMutation.isSuccess) {
      setSuccess(true);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    }
  }, [updateBankMutation.isSuccess, onSuccess]);

  return (
    <div className="">
      {/* Bank Name Dropdown */}
      <div className="mb-4">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Bank Name
        </Paragraph1>
        <div className="relative">
          <select
            value={selectedBank}
            onChange={(e) => {
              setSelectedBank(e.target.value);
              setError("");
            }}
            disabled={isLoadingBanks}
            className="w-full p-3 text-black border border-gray-300 rounded-lg bg-white appearance-none focus:ring-black focus:border-black transition duration-150 disabled:bg-gray-100"
          >
            <option value="" disabled hidden>
              {isLoadingBanks ? "Loading banks..." : "Select bank"}
            </option>
            {banks.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
          <HiOutlineChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Account Number Input */}
      <div className="mb-4">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Account Number
        </Paragraph1>
        <input
          type="number"
          placeholder="Enter account number"
          value={accountNumber}
          onChange={(e) => {
            setAccountNumber(e.target.value);
            setError("");
          }}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150"
        />
      </div>

      {/* Account Name Input */}
      <div className="mb-6">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Account Name
        </Paragraph1>
        <input
          type="text"
          placeholder="Enter name on account"
          value={accountName}
          onChange={(e) => {
            setAccountName(e.target.value);
            setError("");
          }}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <Paragraph1 className="text-xs text-red-700">{error}</Paragraph1>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
          <Paragraph1 className="text-xs text-green-700">
            Bank account updated successfully!
          </Paragraph1>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={updateBankMutation.isPending || isLoadingBanks}
        className="w-full px-4 py-3 font-semibold bg-black text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        <Paragraph1>
          {updateBankMutation.isPending ? "Updating..." : "Update Account"}
        </Paragraph1>
      </button>

      {updateBankMutation.isError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
          <Paragraph1 className="text-xs text-red-700">
            {updateBankMutation.error?.message ||
              "Failed to update bank account. Please try again."}
          </Paragraph1>
        </div>
      )}
    </div>
  );
};

export default EditBankAccountForm;
