import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text"; // Assuming your custom text component
import { HiOutlineArrowUpRight } from "react-icons/hi2";

interface TransactionDetailViewProps {
  /** Modal Control */
  isOpen?: boolean;
  onClose?: () => void;
  transaction?: any;

  /** Summary Info */
  type?: "Debit" | "Credit";
  summaryDate?: string;
  summaryAmount?: string;
  summaryStatus?: "Completed" | "Successful";

  /** Breakdown Details */
  transactionID?: string;
  description?: string;
  amount?: string;
  paymentMethod?: string;

  /** Item Details */
  item?: string;
  orderID?: string;
}

const TransactionDetailView: React.FC<TransactionDetailViewProps> = ({
  isOpen,
  onClose,
  transaction,
  type,
  summaryDate,
  summaryAmount,
  summaryStatus,
  transactionID,
  description,
  amount,
  paymentMethod,
  item,
  orderID,
}) => {
  // Use transaction prop if available, otherwise use individual props
  const txType = transaction?.type || type || "Debit";
  const txDate =
    transaction?.date || transaction?.timestamp || summaryDate || "";
  const txAmount = transaction?.amount || summaryAmount || "";
  const txStatus = transaction?.status || summaryStatus || "Completed";

  // Determine Type Icon and Color
  const isDebit = txType === "Debit";
  const typeColorClass = isDebit ? "text-red-500" : "text-green-600";
  const statusBadgeClass =
    txStatus === "Completed" || txStatus === "completed"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";

  return (
    <div className="font-sans bg-white p-6 rounded-xl border border-gray-200 ">
      {/* 1. Summary Header */}
      <div className="flex justify-between items-center pb-6 border-b border-gray-100">
        {/* Left Side: Icon, Type, Date, Status */}
        <div className="flex items-center space-x-2">
          <div
            className={`p-4 rounded-full ${
              isDebit ? "bg-red-50 border border-red-500" : "bg-green-50"
            } ${typeColorClass}`}
          >
            <HiOutlineArrowUpRight className="w-8 h-8 rotate-90" />{" "}
            {/* Rotate for visual Debit icon */}
          </div>
          <div>
            <Paragraph1 className={`text-base font-bold ${typeColorClass}`}>
              {type}
            </Paragraph1>
            <div className="flex items-center- flex-col gap-2">
              <Paragraph1 className="text-sm text-gray-700">
                {summaryDate}
              </Paragraph1>
              <Paragraph1
                className={`px-2 py-1 rounded-lg text-xs font-medium ${statusBadgeClass}`}
              >
                {summaryStatus}
              </Paragraph1>
            </div>
          </div>
        </div>

        {/* Right Side: Summary Amount */}
        <Paragraph3 className="text-xl font-extrabold text-gray-900">
          {summaryAmount}
        </Paragraph3>
      </div>

      {/* 2. Breakdown Section */}
      <div className="pt-6 pb-4">
        <Paragraph1 className="text-base font-semibold text-gray-900 mb-4">
          Breakdown
        </Paragraph1>

        <div className="space-y-3">
          {/* Key-Value Rows */}
          <div className="flex justify-between">
            <Paragraph1 className="text-sm text-gray-500">
              Transaction ID
            </Paragraph1>
            <Paragraph1 className="text-sm font-medium text-gray-900">
              {transactionID}
            </Paragraph1>
          </div>
          <div className="flex justify-between">
            <Paragraph1 className="text-sm text-gray-500">
              Description
            </Paragraph1>
            <Paragraph1 className="text-sm font-medium text-gray-900">
              {description}
            </Paragraph1>
          </div>
          <div className="flex justify-between">
            <Paragraph1 className="text-sm text-gray-500">Amount</Paragraph1>
            <Paragraph1 className="text-sm font-medium text-gray-900">
              {amount}
            </Paragraph1>
          </div>
          <div className="flex justify-between">
            <Paragraph1 className="text-sm text-gray-500">
              Payment Method
            </Paragraph1>
            <Paragraph1 className="text-sm font-medium text-gray-900">
              {paymentMethod}
            </Paragraph1>
          </div>
        </div>
      </div>

      {/* 3. Details Section (Item/Order) */}
      <div className="pt-6 border-t border-gray-100">
        <Paragraph1 className="text-base font-semibold text-gray-900 mb-4">
          Details
        </Paragraph1>

        <div className="space-y-3">
          <div className="flex justify-between">
            <Paragraph1 className="text-sm text-gray-500">Item</Paragraph1>
            <Paragraph1 className="text-sm font-medium text-gray-900">
              {item}
            </Paragraph1>
          </div>
          <div className="flex justify-between">
            <Paragraph1 className="text-sm text-gray-500">Order ID</Paragraph1>
            <Paragraph1 className="text-sm font-medium text-blue-600 underline cursor-pointer">
              {orderID}
            </Paragraph1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailView;

// --- Example Usage matching the provided image content ---

const ExampleTransactionDetailView: React.FC = () => {
  return (
    <TransactionDetailView
      type="Debit"
      summaryDate="Oct 8, 2025"
      summaryAmount="₦20,000"
      summaryStatus="Completed"
      transactionID="TXTN3349212"
      description="Rental fee- Fendi Boots"
      amount="₦20,000"
      paymentMethod="Wallet"
      item="Fendi Acro Boots"
      orderID="RL-3442121"
    />
  );
};

// export default ExampleTransactionDetailView;
