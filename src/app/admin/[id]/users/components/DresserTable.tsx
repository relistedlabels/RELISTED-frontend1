"use client";
import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import UserDetails from "./UserDetails";
import Image from "next/image";

const StatusPill = ({ isSuspended }: { isSuspended: boolean }) => {
  const isActive = !isSuspended;
  return (
    <div
      className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
        isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
      }`}
    >
      <Paragraph1>{isActive ? "Active" : "Suspended"}</Paragraph1>
    </div>
  );
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

interface DresserTableProps {
  data: any[];
  role?: "LISTER" | "DRESSER" | "ADMIN";
}

export default function DresserTable({
  data,
  role = "DRESSER",
}: DresserTableProps) {
  const isLister = role === "LISTER";
  const isAdmin = role === "ADMIN";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4">
              <Paragraph1 className="text-xs font-semibold text-gray-400 uppercase">
                User
              </Paragraph1>
            </th>
            <th className="px-6 py-4">
              <Paragraph1 className="text-xs font-semibold text-gray-400 uppercase">
                Email
              </Paragraph1>
            </th>
            <th className="px-6 py-4">
              <Paragraph1 className="text-xs font-semibold text-gray-400 uppercase">
                Status
              </Paragraph1>
            </th>
            {!isAdmin && (
              <th className="px-6 py-4">
                <Paragraph1 className="text-xs font-semibold text-gray-400 uppercase">
                  Wallet Balance
                </Paragraph1>
              </th>
            )}
            {!isAdmin && (
              <th className="px-6 py-4">
                <Paragraph1 className="text-xs font-semibold text-gray-400 uppercase">
                  {isLister ? "Total Listings" : "Total Rentals"}
                </Paragraph1>
              </th>
            )}
            <th className="px-6 py-4">
              <Paragraph1 className="text-xs font-semibold text-gray-400 uppercase">
                Joined
              </Paragraph1>
            </th>
            <th className="px-6 py-4">
              <Paragraph1 className="text-xs font-semibold text-gray-400 uppercase">
                Action
              </Paragraph1>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
              <td className="px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                  {getInitials(user.name)}
                </div>
                <div>
                  <Paragraph1 className="font-bold text-gray-900">
                    {user.name}
                  </Paragraph1>
                  <Paragraph1 className="text-xs text-gray-500">
                    {user.role}
                  </Paragraph1>
                </div>
              </td>
              <td className="px-6 py-4">
                <Paragraph1 className="text-gray-500">{user.email}</Paragraph1>
              </td>
              <td className="px-6 py-4">
                <StatusPill isSuspended={user.isSuspended} />
              </td>
              {!isAdmin && (
                <td className="px-6 py-4 font-bold">
                  <Paragraph1>₦0</Paragraph1>
                </td>
              )}
              {!isAdmin && (
                <td className="px-6 py-4 font-bold">
                  <Paragraph1>{user.totalRentals || 0}</Paragraph1>
                </td>
              )}
              <td className="px-6 py-4">
                <Paragraph1 className="text-gray-500">
                  {new Date(user.dateJoined).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                </Paragraph1>
              </td>
              <td className="px-6 py-4">
                <UserDetails userId={user.id} isSuspended={user.isSuspended} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
