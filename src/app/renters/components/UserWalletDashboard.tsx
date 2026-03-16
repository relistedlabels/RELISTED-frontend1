// ENDPOINTS: GET /api/renters/wallet, GET /api/renters/wallet/transactions

"use client";

import React from "react";
import { Paragraph1, Paragraph3, Header2 } from "@/common/ui/Text";
import { FaPlus } from "react-icons/fa";
import {
  HiOutlineShoppingBag,
  HiOutlineCheckCircle,
  HiOutlineCreditCard,
  HiOutlineArrowDownTray,
  HiOutlineExclamationTriangle,
  HiOutlineArrowUpTray,
} from "react-icons/hi2";
import FundWallet from "./FundWallet";
import Withdraw from "./Withdraw";
import { useWallet } from "@/lib/queries/renters/useWallet";
import { motion } from "framer-motion";

interface BalanceCardProps {
  title: string;
  amount: string;
  icon: React.ReactNode;
  note: string;
  isDark?: boolean;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange" | "red";
  trend?: string;
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

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  color,
  trend,
}) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    red: "bg-red-50 border-red-200 text-red-700",
  };

  const iconBgClasses = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    purple: "bg-purple-100",
    orange: "bg-orange-100",
    red: "bg-red-100",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`${colorClasses[color]} border rounded-lg p-4 transition duration-200`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`${iconBgClasses[color]} p-3 rounded-lg`}>{icon}</div>
        {trend && (
          <span className="text-xs font-semibold bg-white px-2 py-1 rounded">
            {trend}
          </span>
        )}
      </div>
      <Paragraph1 className="text-xs font-medium text-gray-600 mb-1">
        {label}
      </Paragraph1>
      <Paragraph3 className="font-bold text-lg">{value}</Paragraph3>
    </motion.div>
  );
};

const UserWalletDashboard: React.FC = () => {
  const { data: walletResponse, isLoading, error } = useWallet();

  if (isLoading) {
    return (
      <div className="font-sans bg-white p-6 rounded-xl animate-pulse">
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !walletResponse) {
    return (
      <div className="font-sans bg-white p-6 rounded-xl">
        <Paragraph1 className="text-red-500">Failed to load wallet</Paragraph1>
      </div>
    );
  }

  const wallet = walletResponse?.wallet;
  const balance = wallet?.balance || {};
  const statistics = wallet?.statistics || {};
  const lastTransaction = wallet?.lastTransaction;

  return (
    <div className="space-y-6">
      {/* Main Wallet Section */}
      <div className="font-sans bg-black text-white p-6 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col justify-between">
            <div className="mb-6">
              <Paragraph1 className="text-sm text-gray-400">
                Your Total Balance
              </Paragraph1>
              <Paragraph3 className="text-4xl font-extrabold mt-1">
                ₦{(balance.totalBalance ?? 0).toLocaleString()}
              </Paragraph3>
              <Paragraph1 className="text-xs text-gray-500 mt-2">
                Last updated:{" "}
                {new Date(
                  balance.lastUpdated || Date.now(),
                ).toLocaleDateString()}
              </Paragraph1>
            </div>

            <div className="flex sm:flex-row flex-col gap-4 mt-4 md:mt-0">
              <FundWallet />
              <Withdraw />
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BalanceCard
              title="Available Balance"
              amount={`₦${(balance.availableBalance ?? 0).toLocaleString()}`}
              icon={<img src="/icons/lock2.png" className="h-[70px] w-auto" />}
              note="Available to spend on rentals"
              isDark={false}
            />

            <BalanceCard
              title="Locked Balance"
              amount={`₦${(balance.lockedBalance ?? 0).toLocaleString()}`}
              icon={<img src="/icons/lock1.png" className="h-[70px] w-auto" />}
              note="Locked in active rentals"
              isDark={true}
            />
          </div>
        </div>
      </div>

      {/* Metrics Grid Section */}
      <div className="space-y-4">
        <Paragraph1 className="text-black font-bold">Wallet Activity</Paragraph1>

        {/* First Row - Primary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Active Rental Orders"
            value={statistics.activeRentalOrders || 0}
            icon={<HiOutlineShoppingBag className="w-6 h-6" />}
            color="blue"
          />
          <MetricCard
            label="Total Spent"
            value={`₦${(statistics.totalSpent || 0).toLocaleString()}`}
            icon={<HiOutlineCreditCard className="w-6 h-6" />}
            color="green"
          />
          <MetricCard
            label="Total Deposits"
            value={`₦${(statistics.totalDeposits || 0).toLocaleString()}`}
            icon={<HiOutlineArrowDownTray className="w-6 h-6" />}
            color="purple"
          />
          <MetricCard
            label="Total Refunds"
            value={`₦${(statistics.totalRefunds || 0).toLocaleString()}`}
            icon={<HiOutlineArrowUpTray className="w-6 h-6" />}
            color="orange"
          />
        </div>

        {/* Second Row - Disputes and Transactions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Active Disputes"
            value={statistics.activeDisputes || 0}
            icon={<HiOutlineExclamationTriangle className="w-6 h-6" />}
            color={statistics.activeDisputes > 0 ? "red" : "green"}
          />

          {/* Last Transaction Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-4 col-span-1 md:col-span-2"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="bg-slate-200 p-3 rounded-lg">
                <HiOutlineCheckCircle className="w-6 h-6 text-slate-700" />
              </div>
              <span className="text-xs font-semibold bg-white px-2 py-1 rounded text-slate-700">
                {lastTransaction?.type === "credit" ? "Credit" : "Debit"}
              </span>
            </div>
            <Paragraph1 className="text-xs font-medium text-gray-600 mb-2">
              Last Transaction
            </Paragraph1>
            <div className="space-y-1">
              <Paragraph3 className="font-bold text-lg">
                ₦{(lastTransaction?.amount || 0).toLocaleString()}
              </Paragraph3>
              <Paragraph1 className="text-xs text-gray-600">
                {lastTransaction?.description || "N/A"}
              </Paragraph1>
              <Paragraph1 className="text-xs text-gray-500 mt-2">
                {new Date(lastTransaction?.date || Date.now()).toLocaleString()}
              </Paragraph1>
            </div>
          </motion.div>
        </div>

        {/* Account Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-slate-50 border border-slate-200 rounded-lg p-4"
          >
            <Paragraph1 className="text-xs font-medium text-gray-600 mb-2">
              Linked Bank Accounts
            </Paragraph1>
            <Paragraph3 className="font-bold text-lg">
              {wallet?.linkedBankAccounts || 0}
            </Paragraph3>
            <Paragraph1 className="text-xs text-gray-500 mt-1">
              {wallet?.linkedBankAccounts === 0
                ? "No accounts linked"
                : `${wallet?.linkedBankAccounts} account(s) available`}
            </Paragraph1>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-slate-50 border border-slate-200 rounded-lg p-4"
          >
            <Paragraph1 className="text-xs font-medium text-gray-600 mb-2">
              Minimum for Transaction
            </Paragraph1>
            <Paragraph3 className="font-bold text-lg">
              ₦{(wallet?.minimumFundsForTransaction || 0).toLocaleString()}
            </Paragraph3>
            <Paragraph1 className="text-xs text-gray-500 mt-1">
              Required balance to start rental
            </Paragraph1>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserWalletDashboard;
