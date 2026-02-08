"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { User } from "@/lib/api/user";

interface ListerDetailsCardProps {
  user: User;
}

export default function ListerDetailsCard({ user }: ListerDetailsCardProps) {
  return (
    <div className="bg-white p-6 w-full max-w-sm border border-gray-200 rounded-2xl shadow-sm">
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-6">
        {user.profileDetails?.avatar ? (
          <img
            src={user.profileDetails.avatar}
            alt={user.name}
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col gap-1 flex-1">
          <Paragraph3 className="text-base font-bold text-gray-900">
            {user.name}
          </Paragraph3>
          <Paragraph1 className="text-xs text-gray-500">{user.role}</Paragraph1>
          <div className="mt-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full w-fit">
            <Paragraph1 className="text-xs font-medium">
              {user.isSuspended ? "Suspended" : "Active"}
            </Paragraph1>
          </div>
        </div>
      </div>

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
              {user.phone || "N/A"}
            </Paragraph1>
          </div>

          <div>
            <Paragraph1 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              JOINED
            </Paragraph1>
            <Paragraph1 className="text-sm text-gray-700">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })}
            </Paragraph1>
          </div>
        </div>
      </div>

      {/* Business Address */}
      {user.profileDetails?.address && (
        <div className="mb-6">
          <Paragraph3 className="text-xs font-bold mb-4 text-gray-600 uppercase tracking-wide">
            Business Address
          </Paragraph3>
          <Paragraph1 className="text-sm text-gray-700">
            {user.profileDetails.address}
          </Paragraph1>
        </div>
      )}

      {/* Bio/Additional Info */}
      {user.profileDetails?.bio && (
        <div>
          <Paragraph3 className="text-xs font-bold mb-4 text-gray-600 uppercase tracking-wide">
            About
          </Paragraph3>
          <Paragraph1 className="text-sm text-gray-700">
            {user.profileDetails.bio}
          </Paragraph1>
        </div>
      )}
    </div>
  );
}
