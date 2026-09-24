"use client";
import React from "react";
import Link from "next/link";
import { Paragraph1 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { useAdminIdStore } from "@/store/useAdminIdStore";

const StatusPill = ({ isSuspended }: { isSuspended: boolean }) => {
  const isActive = !isSuspended;
  return (
    <div
      className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
        isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
      }`}
    >
      <Paragraph1>{isActive ? "Active" : "Suspended"}</Paragraph1>
    </div>
  );
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

type UserRow = {
  id: string;
  name: string;
  email: string;
  role?: string;
  isSuspended: boolean;
  totalRentals?: number;
  dateJoined: string;
};

function buildColumns(adminId: string | null): ResponsiveColumnDef<UserRow>[] {
  return [
    {
      id: "user",
      header: "User",
      mobile: "primary",
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
            {getInitials(user.name)}
          </div>
          <div>
            <Paragraph1 className="font-bold text-gray-900">
              {user.name}
            </Paragraph1>
            <Paragraph1 className="text-xs text-gray-500">{user.role}</Paragraph1>
          </div>
        </div>
      ),
    },
    {
      id: "email",
      header: "Email",
      mobile: "detail",
      render: (user) => (
        <Paragraph1 className="text-gray-500">{user.email}</Paragraph1>
      ),
    },
    {
      id: "status",
      header: "Status",
      mobile: "badge",
      render: (user) => <StatusPill isSuspended={user.isSuspended} />,
    },
    {
      id: "totalRentals",
      header: "Total Rentals",
      mobile: "detail",
      render: (user) => (
        <Paragraph1 className="font-bold">{user.totalRentals || 0}</Paragraph1>
      ),
    },
    {
      id: "joined",
      header: "Joined",
      mobile: "detail",
      render: (user) => (
        <Paragraph1 className="text-gray-500">
          {new Date(user.dateJoined).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })}
        </Paragraph1>
      ),
    },
    {
      id: "action",
      header: "Action",
      mobile: "action",
      render: (user) => (
        <div className="whitespace-nowrap rounded-md bg-black px-2 py-1 text-white">
          <Link href={`/admin/${adminId}/users/${user.id}`}>
            <Paragraph1> View Details</Paragraph1>
          </Link>
        </div>
      ),
    },
  ];
}

export default function AdminTable({ data }: { data: UserRow[] }) {
  const adminId = useAdminIdStore((state) => state.adminId);
  const columns = buildColumns(adminId);

  return (
    <ResponsiveDataTable
      rows={data as unknown as UserRow[]}
      columns={columns}
      getRowKey={(user) => user.id}
      emptyState={
        <div className="px-4 py-8 text-center md:px-6">
          <Paragraph1 className="text-gray-500">No admins found</Paragraph1>
        </div>
      }
    />
  );
}
