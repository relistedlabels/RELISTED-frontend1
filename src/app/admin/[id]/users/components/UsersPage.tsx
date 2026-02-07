"use client";

import React, { useState, useMemo } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { Search, ChevronDown } from "lucide-react";
import DresserTable from "./DresserTable";
import CuratorTable from "./CuratorTable";
import { useGetAllUsers } from "@/lib/queries/user/useGetAllUsers";

type UserRole = "LISTER" | "DRESSER" | "ADMIN";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<UserRole>("LISTER");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // Fetch all users from API
  const { data: usersData, isLoading, error } = useGetAllUsers(1, 100);
  const users = usersData?.users || [];

  // Filtering Logic
  const filteredData = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All Status"
          ? true
          : statusFilter === "Active"
            ? !user.isSuspended
            : user.isSuspended;

      const matchesRole = user.role === activeTab;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, activeTab, searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-6">
        <Paragraph3 className="text-3xl font-bold">Users</Paragraph3>
        <div className="text-center py-12">
          <Paragraph1 className="text-gray-500">Loading users...</Paragraph1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col space-y-6">
        <Paragraph3 className="text-3xl font-bold">Users</Paragraph3>
        <div className="text-center py-12">
          <Paragraph1 className="text-red-500">
            Error loading users. Please try again.
          </Paragraph1>
        </div>
      </div>
    );
  }

  const TABS: UserRole[] = ["LISTER", "DRESSER", "ADMIN"];

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
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
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
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <Paragraph1 className="text-gray-500">
              No users found matching your criteria.
            </Paragraph1>
          </div>
        ) : (
          <DresserTable data={filteredData} role={activeTab} />
        )}
      </div>
    </div>
  );
}
