"use client";
// ENDPOINTS: GET /api/listers/wallet/bank-accounts (list saved accounts), POST /api/listers/wallet/bank-accounts (add new)

import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineChevronDown } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import AddNewBankAccount from "./AddNewBankAccount";
import { useBankAccounts } from "@/lib/queries/listers/useBankAccounts";

interface BankAccountsDropdownContentProps {
  accounts: {
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }[];
  onSelectAccount: (accountId: string, account: any) => void;
}

const BankAccountsDropdownContent: React.FC<
  BankAccountsDropdownContentProps
> = ({ accounts, onSelectAccount }) => {
  return (
    <div className="font-sans bg-white rounded-xl border border-gray-200 shadow-lg p-3">
      {/* List of Existing Accounts */}
      <div className="space-y-2">
        {accounts.map((account) => (
          <button
            key={account.id}
            onClick={() => onSelectAccount(account.id, account)}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition duration-150"
          >
            <Paragraph1 className="text-sm font-semibold text-gray-900 leading-tight">
              {account.bankName} - {account.accountNumber.slice(-4)}
            </Paragraph1>
            <Paragraph1 className="text-xs text-gray-500 mt-0.5">
              {account.accountName}
            </Paragraph1>
          </button>
        ))}
      </div>

      {accounts.length > 0 && <div className="border-t border-gray-100 my-2" />}

      <AddNewBankAccount />
    </div>
  );
};

// ---- DROPDOWN CONTAINER WITH ANIMATION ----

interface BankAccountsDropdownProps {
  onSelect?: (accountId: string) => void;
}

const ExampleBankAccountsDropdown: React.FC<BankAccountsDropdownProps> = ({
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const { data: bankAccountsData, isLoading } = useBankAccounts(true);

  const accounts = bankAccountsData?.data || [];

  const selectedAccountLabel = accounts.find(
    (acc) => acc.id === selectedAccount,
  )
    ? `${accounts.find((acc) => acc.id === selectedAccount)?.bankName} - ****${accounts.find((acc) => acc.id === selectedAccount)?.accountNumber.slice(-4)}`
    : "Select Bank Account";

  const handleSelect = (accountId: string, account: any) => {
    setSelectedAccount(accountId);
    if (onSelect) {
      onSelect(accountId);
    }
    setOpen(false);
  };

  return (
    <div className="mb-4">
      <div className="w-full relative">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-1">
          Bank Account
        </Paragraph1>

        {/* Select button */}
        <button
          onClick={() => setOpen(!open)}
          disabled={isLoading}
          className="w-full p-3 bg-white border border-gray-300 rounded-lg flex justify-between items-center hover:bg-gray-50 disabled:bg-gray-100 transition"
        >
          <span className="text-sm text-gray-700">
            {isLoading ? "Loading accounts..." : selectedAccountLabel}
          </span>
          <HiOutlineChevronDown
            className={`w-5 h-5 text-gray-600 transition-transform ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {/* Dropdown Animation */}
        <AnimatePresence>
          {open && !isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -5 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -5 }}
              transition={{ duration: 0.25 }}
              className="absolute left-0 right-0 mt-2 z-20"
            >
              <BankAccountsDropdownContent
                accounts={accounts}
                onSelectAccount={handleSelect}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExampleBankAccountsDropdown;
