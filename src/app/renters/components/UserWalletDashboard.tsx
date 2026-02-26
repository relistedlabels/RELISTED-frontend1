// ENDPOINTS: GET /api/renters/wallet, GET /api/renters/wallet/transactions

"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { FaPlus } from "react-icons/fa";
import FundWallet from "./FundWallet";
import Withdraw from "./Withdraw";
import { useWallet } from "@/lib/queries/renters/useWallet";

interface BalanceCardProps {
  title: string;
  amount: string;
  icon: React.ReactNode;
  note: string;
  isDark?: boolean;
}

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
      <div className="">{icon}</div>
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

const UserWalletDashboard: React.FC = () => {
  const { data: wallet, isLoading, error } = useWallet();

  if (isLoading) {
    return (
      <div className="font-sans bg-black text-white p-6 rounded-xl animate-pulse">
        <div className="h-48 bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error || !wallet) {
    return (
      <div className="font-sans bg-black text-white p-6 rounded-xl">
        <Paragraph1 className="text-red-500">Failed to load wallet</Paragraph1>
      </div>
    );
  }

  return (
    <div className="font-sans bg-black text-white p-6 rounded-xl ">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col justify-between">
          <div className="mb-6">
            <Paragraph1 className="text-sm text-gray-400">
              Your Total balance:
            </Paragraph1>
            <Paragraph3 className="text-4xl font-extrabold mt-1">
              ₦{(wallet.totalBalance ?? 0).toLocaleString()}
            </Paragraph3>
          </div>

          <div className="flex sm:flex-row flex-col gap-4 mt-4 md:mt-0">
            <FundWallet />
            <Withdraw />
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BalanceCard
            title="Available Balance"
            amount={`₦${(wallet.availableBalance ?? 0).toLocaleString()}`}
            icon={<img src="/icons/lock2.png" className="h-[70px] w-auto" />}
            note="Available to spend on rentals"
            isDark={false}
          />

          <BalanceCard
            title="Locked Balance"
            amount={`₦${(wallet.lockedBalance ?? 0).toLocaleString()}`}
            icon={<img src="/icons/lock1.png" className="h-[70px] w-auto" />}
            note="Locked in active rentals"
            isDark={true}
          />
        </div>
      </div>
    </div>
  );
};

export default UserWalletDashboard;
