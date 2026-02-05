"use client";
import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import UserDetails from "./UserDetails";

const StatusPill = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Active: "bg-green-50 text-green-600",
    Suspended: "bg-gray-100 text-gray-500",
    Pending: "bg-orange-50 text-orange-600",
  };
  return (
    <div
      className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
        styles[status] || styles.Active
      }`}
    >
      <Paragraph1>{status}</Paragraph1>
    </div>
  );
};

export default function DresserTable({ data }: { data: any[] }) {
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
            <th className="px-6 py-4">
              <Paragraph1 className="text-xs font-semibold text-gray-400 uppercase">
                Wallet Balance
              </Paragraph1>
            </th>
            <th className="px-6 py-4">
              <Paragraph1 className="text-xs font-semibold text-gray-400 uppercase">
                Total Rentals
              </Paragraph1>
            </th>
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
                <img
                  src={user.avatar}
                  className="w-10 h-10 rounded-full object-cover"
                  alt=""
                />
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
                <StatusPill status={user.status} />
              </td>
              <td className="px-6 py-4 font-bold">
                <Paragraph1>{user.wallet}</Paragraph1>
              </td>
              <td className="px-6 py-4 font-bold">
                <Paragraph1>{user.rentals}</Paragraph1>
              </td>
              <td className="px-6 py-4">
                <Paragraph1 className="text-gray-500">{user.joined}</Paragraph1>
              </td>
              <td className="px-6 py-4">
                <UserDetails />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
