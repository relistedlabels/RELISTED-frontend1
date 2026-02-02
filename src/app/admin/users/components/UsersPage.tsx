"use client";

import React, { useState, useMemo } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { Search, ChevronDown } from "lucide-react";
import DresserTable from "./DresserTable";
import CuratorTable from "./CuratorTable";

// Mock Data
const DRESSERS_DATA = [
  {
    id: 1,
    name: "Chioma Adeyemi",
    role: "Dresser",
    email: "chioma.adeyemi@example.com",
    status: "Active",
    wallet: "₦125,000",
    rentals: 47,
    joined: "Oct 2024",
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    id: 2,
    name: "Fatima Bello",
    role: "Dresser",
    email: "fatima.bello@example.com",
    status: "Suspended",
    wallet: "₦45,000",
    rentals: 23,
    joined: "Sep 2024",
    avatar: "https://i.pravatar.cc/150?u=2",
  },
  {
    id: 3,
    name: "Grace Adebayo",
    role: "Dresser",
    email: "grace.adebayo@example.com",
    status: "Pending",
    wallet: "₦0",
    rentals: 0,
    joined: "Nov 2024",
    avatar: "https://i.pravatar.cc/150?u=3",
  },
  {
    id: 4,
    name: "Ngozi Eze",
    role: "Dresser",
    email: "ngozi.eze@example.com",
    status: "Active",
    wallet: "₦78,000",
    rentals: 34,
    joined: "Oct 2024",
    avatar: "https://i.pravatar.cc/150?u=4",
  },
];

const CURATORS_DATA = [
  {
    id: 1,
    name: "Anita Cole",
    role: "Curator",
    email: "anita.cole@example.com",
    status: "Active",
    wallet: "₦820,000",
    rentals: 132,
    joined: "Jan 2024",
    avatar: "https://i.pravatar.cc/150?u=5",
  },
  {
    id: 2,
    name: "Blessing Okafor",
    role: "Curator",
    email: "blessing.o@example.com",
    status: "Active",
    wallet: "₦745,000",
    rentals: 118,
    joined: "Feb 2024",
    avatar: "https://i.pravatar.cc/150?u=6",
  },
];

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<"Dressers" | "Curators">(
    "Dressers"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // Filtering Logic
  const filteredData = useMemo(() => {
    const data = activeTab === "Dressers" ? DRESSERS_DATA : CURATORS_DATA;

    return data.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "All Status" || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [activeTab, searchQuery, statusFilter]);

  return (
    <div className="flex flex-col space-y-6">
      <Paragraph3 className="text-3xl font-bold">Users</Paragraph3>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-2/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative w-full md:w-1/4">
          <select
            className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none pr-10 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Suspended</option>
            <option>Pending</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {["Dressers", "Curators"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 transition-all relative ${
              activeTab === tab ? "text-black font-semibold" : "text-gray-400"
            }`}
          >
            <Paragraph1>{tab}</Paragraph1>
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
            )}
          </button>
        ))}
      </div>

      {/* Tables */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {activeTab === "Dressers" ? (
          <DresserTable data={filteredData} />
        ) : (
          <CuratorTable data={filteredData} />
        )}
      </div>
    </div>
  );
}
