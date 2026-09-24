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
  profile?: {
    createdAt?: string;
    avatarUpload?: { url?: string };
    avatar?: string;
  };
};

function buildColumns(
  adminId: string | null,
  isLister: boolean,
  isAdmin: boolean,
): ResponsiveColumnDef<UserRow>[] {
  const columns: ResponsiveColumnDef<UserRow>[] = [
    {
      id: "user",
      header: "User",
      mobile: "primary",
      render: (user) => {
        const avatar =
          user.profile?.avatarUpload?.url ?? user.profile?.avatar ?? null;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
              {avatar ? (
                <img
                  src={avatar}
                  alt={`${user.name} avatar`}
                  className="h-full w-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <span className="text-lg">{getInitials(user.name)}</span>
              )}
            </div>
            <div>
              <Paragraph1 className="font-bold text-gray-900">
                {user.name}
              </Paragraph1>
              <Paragraph1 className="text-xs text-gray-500">
                {user.role}
              </Paragraph1>
            </div>
          </div>
        );
      },
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
  ];

  if (!isAdmin) {
    columns.push({
      id: "walletBalance",
      header: "Wallet Balance",
      mobile: "detail",
      render: () => <Paragraph1 className="font-bold">₦0</Paragraph1>,
    });
    columns.push({
      id: "totalCount",
      header: isLister ? "Total Listings" : "Total Rentals",
      mobile: "detail",
      render: (user) => (
        <Paragraph1 className="font-bold">{user.totalRentals || 0}</Paragraph1>
      ),
    });
  }

  columns.push(
    {
      id: "profileCreated",
      header: "Profile Created",
      mobile: "detail",
      render: (user) => {
        const profileDate = user.profile?.createdAt
          ? new Date(user.profile.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })
          : "N/A";
        return <Paragraph1 className="text-gray-500">{profileDate}</Paragraph1>;
      },
    },
    {
      id: "action",
      header: "Action",
      mobile: "action",
      render: (user) => (
        <div className="whitespace-nowrap rounded-md bg-black px-2 py-1 text-white">
          <Link href={`/admin/${adminId || ""}/users/${user.id}`}>
            <Paragraph1> View Details</Paragraph1>
          </Link>
        </div>
      ),
    },
  );

  return columns;
}

interface DresserTableProps {
  data: UserRow[];
  role?: "LISTER" | "DRESSER" | "ADMIN";
}

export default function DresserTable({
  data,
  role = "DRESSER",
}: DresserTableProps) {
  const adminId = useAdminIdStore((state) => state.adminId);
  const isLister = role === "LISTER";
  const isAdmin = role === "ADMIN";
  const columns = buildColumns(adminId, isLister, isAdmin);

  return (
    <ResponsiveDataTable
      rows={data as unknown as UserRow[]}
      columns={columns}
      getRowKey={(user) => user.id}
      emptyState={
        <div className="px-4 py-8 text-center md:px-6">
          <Paragraph1 className="text-gray-500">No users found</Paragraph1>
        </div>
      }
    />
  );
}
