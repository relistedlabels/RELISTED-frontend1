"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import WithdrawalRequestTable from "../wallets/components/WithdrawalRequestTable";

export default function WithdrawalRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <Paragraph2 className="mb-2 text-gray-900">Withdrawal Requests</Paragraph2>
        <Paragraph1 className="text-gray-600">
          Review, approve, reject, or mark lister and renter withdrawals as paid.
        </Paragraph1>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-lg bg-white py-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full flex-1 md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by user name or reference"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white">
        <WithdrawalRequestTable searchQuery={searchQuery} />
      </div>
    </div>
  );
}
