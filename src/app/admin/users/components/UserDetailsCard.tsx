"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface UserDetailsCardProps {
  user: {
    id: string;
    name: string;
    role: string;
    status: string;
    avatar: string;
    email: string;
    phone: string;
    joinDate: string;
    walletBalance: string;
    totalRentals: number;
  };
}

export default function UserDetailsCard({ user }: UserDetailsCardProps) {
  const router = useRouter();

  const handleViewProfile = () => {
    router.push(`/admin/users/${user.id}`);
  };

  return (
    <div className="bg-white p-6 w-full max-w-sm border border-gray-200 rounded-2xl shadow-sm">
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-14 h-14 rounded-full object-cover"
        />
        <div className="flex flex-col gap-1 flex-1">
          <Paragraph3 className="text-base font-bold text-gray-900">
            {user.name}
          </Paragraph3>
          <Paragraph1 className="text-xs text-gray-500">{user.role}</Paragraph1>
          <div className="mt-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full w-fit">
            <Paragraph1 className="text-xs font-medium">
              {user.status}
            </Paragraph1>
          </div>
        </div>
      </div>

      {/* View Full Profile Button */}
      <button
        onClick={handleViewProfile}
        className="w-full mb-6 px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
      >
        View Full Profile
      </button>

      {/* Contact Information */}
      <div className="mb-6">
        <Paragraph3 className="text-xs font-bold mb-4 text-gray-600 uppercase tracking-wide">
          Contact Information
        </Paragraph3>

        <div className="space-y-3">
          <div>
            <Paragraph1 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              EMAIL
            </Paragraph1>
            <Paragraph1 className="text-sm text-gray-700">
              {user.email}
            </Paragraph1>
          </div>

          <div>
            <Paragraph1 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              PHONE
            </Paragraph1>
            <Paragraph1 className="text-sm text-gray-700">
              {user.phone}
            </Paragraph1>
          </div>

          <div>
            <Paragraph1 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              JOINED
            </Paragraph1>
            <Paragraph1 className="text-sm text-gray-700">
              {user.joinDate}
            </Paragraph1>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <Paragraph3 className="text-xs font-bold mb-4 text-gray-600 uppercase tracking-wide">
          Quick Stats
        </Paragraph3>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <Paragraph1 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Wallet Balance
            </Paragraph1>
            <Paragraph1 className="text-sm font-bold text-gray-900">
              {user.walletBalance}
            </Paragraph1>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <Paragraph1 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Total Rentals
            </Paragraph1>
            <Paragraph1 className="text-sm font-bold text-gray-900">
              {user.totalRentals}
            </Paragraph1>
          </div>
        </div>
      </div>
    </div>
  );
}
