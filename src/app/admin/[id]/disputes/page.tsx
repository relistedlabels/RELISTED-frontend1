"use client";
// ENDPOINTS: GET /api/admin/disputes/stats, GET /api/admin/disputes, GET /api/admin/disputes/:disputeId

import { useState } from "react";
import { Search, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import StatusCard from "./components/StatusCard";
import PendingTable from "./components/PendingTable";
import UnderReviewTable from "./components/UnderReviewTable";
import ResolvedTable from "./components/ResolvedTable";

type TabType = "pending" | "under-review" | "resolved";

interface StatusData {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "warning" | "info" | "success";
}

export default function DisputesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const statuses: StatusData[] = [
    {
      label: "Pending Review",
      value: 1,
      color: "warning",
      icon: (
        <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg">
          <AlertCircle size={24} />
        </div>
      ),
    },
    {
      label: "Under Review",
      value: 2,
      color: "info",
      icon: (
        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
          <Clock size={24} />
        </div>
      ),
    },
    {
      label: "Resolved This Month",
      value: 5,
      color: "success",
      icon: (
        <div className="bg-green-100 text-green-600 p-3 rounded-lg">
          <CheckCircle size={24} />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen ">
      {/* Header Section */}
      <div className="mb-8">
        <Paragraph2 className="text-gray-900 mb-2">Disputes</Paragraph2>
        <Paragraph1 className="text-gray-600">
          Manage and resolve disputes between dressers and curators.
        </Paragraph1>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {statuses.map((status, index) => (
          <StatusCard key={index} {...status} />
        ))}
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg py-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search disputes, orders or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {/* Tabs and Table Section */}
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          <TabButton
            active={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
            label="Pending (1)"
          />
          <TabButton
            active={activeTab === "under-review"}
            onClick={() => setActiveTab("under-review")}
            label="Under Review (2)"
          />
          <TabButton
            active={activeTab === "resolved"}
            onClick={() => setActiveTab("resolved")}
            label="Resolved (2)"
          />
        </div>

        {/* Table Content */}
        <div className="py-6">
          {activeTab === "pending" && (
            <PendingTable searchQuery={searchQuery} />
          )}
          {activeTab === "under-review" && (
            <UnderReviewTable searchQuery={searchQuery} />
          )}
          {activeTab === "resolved" && (
            <ResolvedTable searchQuery={searchQuery} />
          )}
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function TabButton({ active, onClick, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 font-medium transition-colors ${
        active
          ? "text-gray-900 border-b-2 border-gray-900"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      <Paragraph1>{label}</Paragraph1>
    </button>
  );
}
