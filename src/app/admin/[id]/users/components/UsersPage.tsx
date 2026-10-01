"use client";

import { Mail, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminComboBox } from "@/app/admin/components/AdminComboBox";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { Paragraph1 } from "@/common/ui/Text";
import { useAdminAllUsers } from "@/lib/queries/admin/useUsers";
import { AdminSectionTabs } from "../../../components/AdminSectionTabs";
import CuratorTable from "./CuratorTable";
import DresserTable from "./DresserTable";
import NewsletterModal from "./NewsletterModal";

type UserRole = "LISTER" | "RENTER" | "ADMIN";

const STATUS_FILTER_OPTIONS = [
  { value: "All Status", label: "All Status" },
  { value: "Active", label: "Active" },
  { value: "Suspended", label: "Suspended" },
] as const;

function tabLabel(role: UserRole, listerCount?: number, renterCount?: number) {
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
    return users.filter(
      (user: {
        name: string;
        email: string;
        isSuspended: boolean;
        role: string;
      }) => {
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
      },
    );
  }, [users, activeTab, searchQuery, statusFilter]);

  if (error) {
    console.error("Failed to load users:", error);
  }

  const TABS: UserRole[] = ["LISTER", "RENTER"];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        className="!mb-0"
        title="Users"
        description="Manage renters and listers."
        action={
          <button
            type="button"
            onClick={() => setIsNewsletterModalOpen(true)}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            <Mail className="h-5 w-5" />
            Newsletter
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:grid-cols-[minmax(0,1fr)_minmax(13rem,0.34fr)]">
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            className="h-11 w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="min-w-0">
          <AdminComboBox
            value={statusFilter}
            onChange={setStatusFilter}
            options={[...STATUS_FILTER_OPTIONS]}
            ariaLabel="User status"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <AdminSectionTabs
          className="bg-white px-2 sm:px-3"
          tabs={TABS.map((tab) => ({
            id: tab,
            label: tabLabel(tab, listerCount, renterCount),
          }))}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as UserRole)}
        />

        {showTableSkeleton ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="py-12 text-center">
            <Paragraph1 className="text-red-600">
              Failed to load users. Check your session and try again.
            </Paragraph1>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-12 text-center">
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
