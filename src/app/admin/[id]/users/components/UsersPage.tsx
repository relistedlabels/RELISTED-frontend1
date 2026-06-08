"use client";

import React, { useState, useMemo } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { Search, Mail } from "lucide-react";
import { AdminComboBox } from "@/app/admin/components/AdminComboBox";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import DresserTable from "./DresserTable";
import CuratorTable from "./CuratorTable";
import NewsletterModal from "./NewsletterModal";
import { useAdminAllUsers } from "@/lib/queries/admin/useUsers";

type UserRole = "LISTER" | "RENTER" | "ADMIN";

const STATUS_FILTER_OPTIONS = [
  { value: "All Status", label: "All Status" },
  { value: "Active", label: "Active" },
  { value: "Suspended", label: "Suspended" },
] as const;

function tabLabel(
  role: UserRole,
  listerCount?: number,
  renterCount?: number,
) {
  if (listerCount === undefined || renterCount === undefined) {
    return role === "LISTER" ? "Lister" : "Renters";
  }
  if (role === "LISTER") return `Lister (${listerCount})`;
  return `Renters (${renterCount})`;
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<UserRole>("LISTER");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);

  const { data: usersData, isLoading, isError, error } = useAdminAllUsers();
  const users = usersData?.data?.users || [];
  const showTableSkeleton = isLoading && users.length === 0;

  const { listerCount, renterCount } = useMemo(() => {
    let listers = 0;
    let renters = 0;
    for (const u of users as { role?: string }[]) {
      if (u.role === "LISTER") listers += 1;
      else if (u.role === "RENTER") renters += 1;
    }
    return { listerCount: listers, renterCount: renters };
  }, [users]);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((user: { name: string; email: string; isSuspended: boolean; role: string }) => {
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q);

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

  if (error) {
    console.error("Failed to load users:", error);
  }

  const TABS: UserRole[] = ["LISTER", "RENTER"];

  return (
    <div className="flex flex-col space-y-6">
      <Paragraph3 className="text-3xl font-bold">Users</Paragraph3>

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
        <button
          type="button"
          onClick={() => setIsNewsletterModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold text-sm"
        >
          <Mail className="w-5 h-5" />
          Newsletter
        </button>
        <div className="w-full md:w-1/4">
          <AdminComboBox
            value={statusFilter}
            onChange={setStatusFilter}
            options={[...STATUS_FILTER_OPTIONS]}
            ariaLabel="User status"
          />
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 transition-all relative ${
              activeTab === tab ? "text-black font-semibold" : "text-gray-400"
            }`}
          >
            <Paragraph1>{tabLabel(tab, listerCount, renterCount)}</Paragraph1>
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {showTableSkeleton ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="text-center py-12">
            <Paragraph1 className="text-red-600">
              Failed to load users. Check your session and try again.
            </Paragraph1>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12">
            <Paragraph1 className="text-gray-500">
              No users found matching your criteria.
            </Paragraph1>
          </div>
        ) : activeTab === "RENTER" ? (
          <DresserTable data={filteredData} />
        ) : (
          <CuratorTable data={filteredData} />
        )}
      </div>

      <NewsletterModal
        isOpen={isNewsletterModalOpen}
        onClose={() => setIsNewsletterModalOpen(false)}
      />
    </div>
  );
}
