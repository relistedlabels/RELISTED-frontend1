"use client";

import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineChevronRight, HiOutlineChevronDown } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import AddNewBankAccount from "./AddNewBankAccount";

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface BankAccountsDropdownContentProps {
  accounts: BankAccount[];
  onSelectAccount: (account: BankAccount) => void;
  onAddNewAccount: () => void;
}

const BankAccountsDropdownContent: React.FC<
  BankAccountsDropdownContentProps
> = ({ accounts, onSelectAccount, onAddNewAccount }) => {
  return (
    <div className="font-sans bg-white rounded-xl border border-gray-200 shadow-lg p-3">
      {/* List of Existing Accounts */}
      <div className="space-y-2">
        {accounts.map((account) => (
          <button
            key={account.accountNumber}
            onClick={() => onSelectAccount(account)}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition duration-150"
          >
            <Paragraph1 className="text-sm font-semibold text-gray-900 leading-tight">
              {account.bankName} - {account.accountNumber}
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

const ExampleBankAccountsDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);

  const sampleAccounts: BankAccount[] = [
    {
      bankName: "Access Bank",
      accountNumber: "02345676555",
      accountName: "John Bassey",
    },
    {
      bankName: "GTBank",
      accountNumber: "02345676555",
      accountName: "John Bassey",
    },
  ];

  const handleSelect = (account: BankAccount) => {
    alert(`Selected: ${account.bankName}`);
    setOpen(false);
  };

  const handleAdd = () => {
    alert("Navigating to add new bank account form...");
    setOpen(false);
  };

  return (
    <div className=" mb-4">
      <div className="w-full  relative">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-1">
          Bank Account
        </Paragraph1>

        {/* Select button */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full p-3 bg-white border border-gray-300 rounded-lg flex justify-between items-center hover:bg-gray-50 transition"
        >
          <span className="text-sm text-gray-700">Select Bank Account</span>
          <HiOutlineChevronDown
            className={`w-5 h-5 text-gray-600 transition-transform ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {/* Dropdown Animation */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -5 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -5 }}
              transition={{ duration: 0.25 }}
              className="absolute left-0 right-0 mt-2 z-20"
            >
              <BankAccountsDropdownContent
                accounts={sampleAccounts}
                onSelectAccount={handleSelect}
                onAddNewAccount={handleAdd}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExampleBankAccountsDropdown;
