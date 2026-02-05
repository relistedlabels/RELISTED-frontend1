"use client";
import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import UserDetails from "./UserDetails";

export default function CuratorTable({ data }: { data: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4">
              <Paragraph1 className="text-xs font-semibold text-gray-400 uppercase">
                Curator
              </Paragraph1>
            </th>
            <th className="px-6 py-4">
              <Paragraph1 className="text-xs font-semibold text-gray-400 uppercase">
                Status
              </Paragraph1>
            </th>
            <th className="px-6 py-4">
              <Paragraph1 className="text-xs font-semibold text-gray-400 uppercase">
                Earnings
              </Paragraph1>
            </th>
            <th className="px-6 py-4">
              <Paragraph1 className="text-xs font-semibold text-gray-400 uppercase">
                Rentals
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
          {data.map((curator) => (
            <tr
              key={curator.id}
              className="hover:bg-gray-50/30 transition-colors"
            >
              <td className="px-6 py-4 flex items-center gap-3">
                <img
                  src={curator.avatar}
                  className="w-10 h-10 rounded-full object-cover"
                  alt=""
                />
                <Paragraph1 className="font-bold text-gray-900">
                  {curator.name}
                </Paragraph1>
              </td>
              <td className="px-6 py-4">
                <div className="px-3 py-1 rounded-full text-xs font-medium w-fit bg-green-50 text-green-600">
                  <Paragraph1>{curator.status}</Paragraph1>
                </div>
              </td>
              <td className="px-6 py-4 font-bold">
                <Paragraph1>{curator.wallet}</Paragraph1>
              </td>
              <td className="px-6 py-4 font-bold">
                <Paragraph1>{curator.rentals}</Paragraph1>
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
