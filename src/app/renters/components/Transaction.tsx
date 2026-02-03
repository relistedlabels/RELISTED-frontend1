import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineArrowUpRight, HiOutlineArrowDownLeft } from "react-icons/hi2";
import { FaLock } from "react-icons/fa";
import TransactionDetails from "./TransactionDetails";
import TransactionDetailsPanel from "./TransactionDetails";

interface Transaction {
  id: string;
  description: string;
  type: "Debit" | "Credit" | "Locked";
  date: string;
  amount: string;
  status: "Completed" | "Locked" | "Successful";
  onClick?: any;
}

// Revised Sub-component to render a single transaction Card/Div
const TransactionItem: React.FC<Transaction> = ({
  id,
  description,
  type,
  date,
  amount,
  status,
  onClick,
}) => {
  // Determine Type Icon and Color
  let typeIcon: React.ReactNode;
  let typeColorClass = "text-gray-900";

  switch (type) {
    case "Debit":
      typeIcon = <HiOutlineArrowUpRight className="w-4 h-4" />;
      break;
    case "Credit":
      typeIcon = <HiOutlineArrowDownLeft className="w-4 h-4" />;
      typeColorClass = "text-green-600";
      break;
    case "Locked":
      typeIcon = <FaLock className="w-3 h-3" />;
      typeColorClass = "text-orange-500";
      break;
    default:
      typeIcon = null;
  }

  // Determine Status Badge Color
  let statusBadgeClass = "";
  switch (status) {
    case "Completed":
    case "Successful":
      statusBadgeClass = "bg-green-100 text-green-800";
      break;
    case "Locked":
      statusBadgeClass = "bg-yellow-100 text-orange-800";
      break;
    default:
      statusBadgeClass = "bg-gray-100 text-gray-800";
  }

  // Determine Amount Color
  const amountColorClass =
    type === "Credit" ? "text-green-600" : "text-gray-900";

  return (
    <div
      onClick={onClick}
      className="bg-white cursor-pointer p-4 sm:p-5 rounded-xl border border-gray-200  mb-3"
    >
      {/* Top Row */}
      <div
        className="
    grid grid-cols-2 gap-4
    lg:flex lg:flex-wrap lg:justify-between lg:items-start
  "
      >
        {" "}
        {/* ID */}
        <div className="">
          <Paragraph1 className="text-xs text-gray-500">ID</Paragraph1>
          <Paragraph1 className="text-xs font-bold ">{id}</Paragraph1>
        </div>
        {/* Type */}
        <div className="">
          <Paragraph1> Type </Paragraph1>
          <div className=" flex gap-2">
            {" "}
            <Paragraph1 className={` font-bold ${typeColorClass}`}>
              {type}
            </Paragraph1>
            <span className={`text-xs ${typeColorClass}`}>{typeIcon}</span>
          </div>
        </div>
        {/* Description */}
        <div>
          <Paragraph1 className="text-xs text-gray-500">Description</Paragraph1>
          <Paragraph1 className="text-sm font-semibold text-gray-900 leading-snug">
            {description}
          </Paragraph1>
        </div>
        <div className="">
          <Paragraph1 className="text-xs text-gray-500">Date</Paragraph1>
          <Paragraph1 className="text-xs">{date}</Paragraph1>
        </div>
        <div className="">
          <Paragraph1 className="text-xs text-gray-500">Amount</Paragraph1>
          <Paragraph1 className={`text-base font-bold ${amountColorClass}`}>
            {amount}
          </Paragraph1>
        </div>
        {/* Amount & Status */}
        <div className="flex flex-col sm:items-end shrink-0">
          <span
            className={`mt-1 px-4 py-2 rounded-lg text-xs font-medium ${statusBadgeClass}`}
          >
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

interface AllTransactionsListProps {
  transactions: Transaction[];
}

const AllTransactionsList: React.FC<AllTransactionsListProps> = ({
  transactions,
}) => {

const [isOpen, setIsOpen] = useState(false);
const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

const openDetails = (tx: Transaction) => {
  setSelectedTx(tx);
  setIsOpen(true);
};

  return (
    <div className="font-sans  pt-[30px]">
      <Paragraph1 className="text-xl font-extrabold text-gray-900 uppercase mb-4">
        All Transactions
      </Paragraph1>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <TransactionItem
            key={tx.id + tx.date}
            {...tx}
            onClick={() => openDetails(tx)}
          />
        ))}
      </div>

      {/* Attach the sidebar */}
      <TransactionDetailsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        transaction={selectedTx} // <-- pass data inside the panel
      />
    </div>
  );
};

// --- Example Usage matching the provided image content ---

const ExampleAllTransactionsList: React.FC = () => {
 
  const sampleTransactions: Transaction[] = [
    {
      id: "345GFDVR4346764",
      description: "Rental fee - Fendi Boots",
      type: "Debit",
      date: "Oct 19, 2025",
      amount: "₦550,000",
      status: "Completed",
    },
    {
      id: "345GFDVR4346764",
      description: "Escrow - Fendi Boots",
      type: "Locked",
      date: "Oct 19, 2025",
      amount: "₦550,000",
      status: "Locked",
    },
    {
      id: "345GFDVR4346764",
      description: "Wallet Funded",
      type: "Credit",
      date: "Oct 19, 2025",
      amount: "+₦550,000",
      status: "Successful",
    },
  ];

  return <AllTransactionsList transactions={sampleTransactions} />;
};

export default ExampleAllTransactionsList;
