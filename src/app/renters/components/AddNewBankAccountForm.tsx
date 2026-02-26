// ENDPOINTS: POST /api/renters/wallet/bank-accounts, GET /api/banks

"use client";

import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineChevronDown } from "react-icons/hi2";
import { useAddBankAccount } from "@/lib/mutations/renters/useWalletMutations";

// Hardcoded Nigerian banks - ideally this would come from GET /api/banks
const NIGERIAN_BANKS = [
  { code: "007", name: "Access Bank Nigeria" },
  { code: "023", name: "Citibank Nigeria" },
  { code: "050", name: "Eco Bank Nigeria" },
  { code: "011", name: "First Bank Nigeria" },
  { code: "058", name: "GTBank" },
  { code: "081", name: "Guaranty Trust Bank" },
  { code: "066", name: "Skye Bank" },
  { code: "087", name: "Diamond Bank" },
  { code: "033", name: "United Bank for Africa" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
];

const AddNewBankAccountForm: React.FC = () => {
  const [formData, setFormData] = useState({
    bankCode: "",
    accountNumber: "",
    accountName: "",
    accountType: "savings",
  });
  const [isOpen, setIsOpen] = useState(false);

  const addBankAccountMutation = useAddBankAccount();

  const handleBankChange = (code: string) => {
    setFormData({ ...formData, bankCode: code });
    setIsOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.bankCode ||
      !formData.accountNumber ||
      !formData.accountName
    ) {
      alert("Please fill in all fields");
      return;
    }

    addBankAccountMutation.mutate(formData, {
      onSuccess: () => {
        alert("Bank account added successfully!");
        setFormData({
          bankCode: "",
          accountNumber: "",
          accountName: "",
          accountType: "savings",
        });
      },
      onError: (error: any) => {
        alert(error?.message || "Failed to add bank account");
      },
    });
  };

  const selectedBank = NIGERIAN_BANKS.find((b) => b.code === formData.bankCode);

  return (
    <div className="">
      {/* Bank Name Dropdown */}
      <div className="mb-4">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Bank Name
        </Paragraph1>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-3 text-black border border-gray-300 rounded-lg bg-white text-left appearance-none focus:ring-black focus:border-black transition duration-150 flex justify-between items-center"
          >
            <span>{selectedBank?.name || "Select bank"}</span>
            <HiOutlineChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {NIGERIAN_BANKS.map((bank) => (
                <button
                  key={bank.code}
                  type="button"
                  onClick={() => handleBankChange(bank.code)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm text-gray-700"
                >
                  {bank.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Account Number Input */}
      <div className="mb-4">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Account Number
        </Paragraph1>
        <input
          type="text"
          placeholder="Enter account number"
          value={formData.accountNumber}
          onChange={(e) => handleInputChange("accountNumber", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150"
        />
      </div>

      {/* Account Name Input */}
      <div className="mb-6">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Account Holder Name
        </Paragraph1>
        <input
          type="text"
          placeholder="Enter name on account"
          value={formData.accountName}
          onChange={(e) => handleInputChange("accountName", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150"
        />
      </div>

      {/* Account Type */}
      <div className="mb-6">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Account Type
        </Paragraph1>
        <select
          value={formData.accountType}
          onChange={(e) => handleInputChange("accountType", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150"
        >
          <option value="savings">Savings</option>
          <option value="current">Current</option>
          <option value="checking">Checking</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={addBankAccountMutation.isPending}
        className="w-full p-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 disabled:opacity-50 transition"
      >
        {addBankAccountMutation.isPending ? "Adding..." : "Add Bank Account"}
      </button>

      {addBankAccountMutation.isError && (
        <Paragraph1 className="text-red-600 text-sm mt-2">
          Error:{" "}
          {(addBankAccountMutation.error as any)?.message ||
            "Failed to add account"}
        </Paragraph1>
      )}
    </div>
  );
};

export default AddNewBankAccountForm;
