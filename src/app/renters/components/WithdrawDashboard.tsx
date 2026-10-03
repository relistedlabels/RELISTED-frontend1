"use client";

import { Paragraph1 } from "@/common/ui/Text";
import Withdraw from "./Withdraw";
import WithdrawalsList from "@/components/wallet/WithdrawalsList";

export default function WithdrawDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Paragraph1 className="font-medium text-gray-800 text-sm leading-relaxed">
          Request a payout or track your withdrawal history.
        </Paragraph1>
        <div className="flex justify-end">
          <Withdraw className="w-fit min-w-[9.5rem] px-6" />
        </div>
      </div>
      <WithdrawalsList variant="renter" />
    </div>
  );
}
