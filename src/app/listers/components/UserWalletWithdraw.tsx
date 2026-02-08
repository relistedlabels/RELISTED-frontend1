// ENDPOINTS: POST /api/listers/wallet/withdraw (submit withdrawal), GET /api/listers/wallet/bank-accounts
import React from "react";
import { Paragraph1 } from "@/common/ui/Text"; // Assuming your custom text component
import { HiOutlineInformationCircle } from "react-icons/hi2";
import { FaWallet } from "react-icons/fa"; // Using FaWallet for the icon
import ExampleBankAccountsDropdown from "./BankAccountsDropdownContent";

interface WithdrawalFormProps {
  /** The current available balance shown to the user */
  availableBalance: string;
}

const WithdrawalForm: React.FC<WithdrawalFormProps> = ({
  availableBalance,
}) => {
  return (
    <div className="font-sans bg-white ">
      {/* Available Balance Display */}
      <div className="p-4 bg-gray-100 rounded-xl mb-6">
        <Paragraph1 className="text-sm text-gray-500 mb-1">
          Available Balance
        </Paragraph1>
        <div className="flex items-center space-x-2">
          <img src="/icons/lock2.png" className="h-[41px] w-auto" />{" "}
          <Paragraph1 className="text-xl font-bold text-gray-900">
            {availableBalance}
          </Paragraph1>
        </div>
        <Paragraph1 className="text-xs text-gray-500 mt-1">
          Make only 5 debits in a month
        </Paragraph1>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
          Amount
        </Paragraph1>
        <div className="relative">
          <input
            type="number"
            placeholder="0.00"
            className="w-full p-3 pl-8 text-lg border border-gray-300 rounded-lg focus:ring-black focus:border-black transition duration-150"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg text-gray-500 font-bold">
            ₦
          </span>
        </div>
      </div>

      {/* Bank Account Selection */}
      <ExampleBankAccountsDropdown />

      {/* Information Notice */}
      <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg flex items-start space-x-2 mb-6">
        <HiOutlineInformationCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <Paragraph1 className="text-xs text-gray-700 leading-snug">
          Withdrawals typically process within 24/48 hours. A confirmation email
          will be sent once processed.
        </Paragraph1>
      </div>
    </div>
  );
};

// --- Example Usage ---

const ExampleWithdrawalForm: React.FC = () => {
  return <WithdrawalForm availableBalance="₦280,000.00" />;
};

export default ExampleWithdrawalForm;
