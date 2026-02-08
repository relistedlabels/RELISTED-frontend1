// ENDPOINTS: GET /api/renters/wallet, GET /api/renters/wallet/transactions

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text"; // Assuming your custom text component
import { HiOutlineArrowDownRight } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa"; // Using FaPlus for the "Fund" button
import FundWallet from "./FundWallet";
import Withdraw from "./Withdraw";

interface BalanceCardProps {
  title: string;
  amount: string;
  icon: React.ReactNode;
  note: string;
  isDark?: boolean;
}

// Sub-component for the Available Balance and Collateral cards
const BalanceCard: React.FC<BalanceCardProps> = ({
  title,
  amount,
  icon,
  note,
  isDark = false,
}) => (
  <div
    className={`p-4 rounded-xl flex flex-col justify-between ${
      isDark ? "bg-[#333333] text-white" : "bg-gray-200 text-gray-900"
    } h-full`}
  >
    <Paragraph1 className=" text-gray-400 mb-2">{title}</Paragraph1>
    <div className="flex items-center space-x-2">
      <div className="">{icon}</div> {/* Icon area */}
      <div>
        <Paragraph1 className=" font-bold">{amount}</Paragraph1>
        <Paragraph1
          className={` mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          {note}
        </Paragraph1>
      </div>
    </div>
  </div>
);

interface UserWalletDashboardProps {
  totalBalance: string;
  availableBalance: string;
  collateralBalance: string;
}

const UserWalletDashboard: React.FC<UserWalletDashboardProps> = ({
  totalBalance,
  availableBalance,
  collateralBalance,
}) => {
  return (
    <div className="font-sans bg-black text-white p-6 rounded-xl ">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Total Balance and Actions */}
        <div className="md:col-span-1 flex flex-col justify-between">
          <div className="mb-6">
            <Paragraph1 className="text-sm text-gray-400">
              Your Total balance:
            </Paragraph1>
            <Paragraph3 className="text-4xl font-extrabold mt-1">
              {totalBalance}
            </Paragraph3>
          </div>

          {/* Action Buttons */}
          <div className="flex sm:flex-row flex-col gap-4 mt-4 md:mt-0">
            <FundWallet />
            <Withdraw />
          </div>
        </div>

        {/* Right Columns: Balance Breakdowns */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Available Balance Card */}
          <BalanceCard
            title="Available Balance"
            amount={availableBalance}
            icon={<img src="/icons/lock2.png" className="h-[70px] w-auto" />}
            note="Make only 5 deposits in a month"
            isDark={false} // Light card
          />

          {/* Clothing Collateral Card */}
          <BalanceCard
            title="Clothing Collateral"
            amount={collateralBalance}
            icon={<img src="/icons/lock1.png" className="h-[70px] w-auto" />}
            note="Make only X deposits in X month"
            isDark={true} // Dark card to match the image
          />
        </div>
      </div>
    </div>
  );
};

// --- Example Usage matching the provided image content ---

const ExampleUserWalletDashboard: React.FC = () => {
  return (
    <UserWalletDashboard
      totalBalance="₦500,000.00"
      availableBalance="₦280,000.00"
      collateralBalance="₦280,000.00"
    />
  );
};

export default ExampleUserWalletDashboard;
