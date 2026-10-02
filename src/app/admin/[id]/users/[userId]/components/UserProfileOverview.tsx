// ENDPOINTS: GET /api/admin/users/:userId
"use client";

import React from "react";
import { AlertCircle, MapPin, Store } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { userRoleLabel } from "@/lib/utils/userRoleLabel";

interface UserProfileOverviewProps {
  user: any;
}

export default function UserProfileOverview({
  user,
}: UserProfileOverviewProps) {
  if (!user || !user.profile) {
    return (
      <div className="text-center py-12">
        <Paragraph1 className="text-gray-500">
          Unable to load user profile. Missing required data.
        </Paragraph1>
      </div>
    );
  }

  const profile = user.profile;
  const business = profile?.businessInfo;
  const address = profile?.address;
  const emergency = profile?.emergencyContact;
  const avatarUpload = profile?.avatarUpload;

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Account Status
          </Paragraph1>
          <Paragraph3 className="text-lg font-bold text-gray-900">
            {user.isSuspended ? "Suspended" : "Active"}
          </Paragraph3>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Member Since
          </Paragraph1>
          <Paragraph3 className="text-lg font-bold text-gray-900">
            {joinDate}
          </Paragraph3>
        </div>
      </div>

      {/* Account Overview */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <Paragraph3 className="text-base font-bold mb-3 text-gray-900">
          Account Overview
        </Paragraph3>
        <Paragraph1 className="text-sm text-gray-600 leading-relaxed">
          {user.name} is a {userRoleLabel(user.role).toLowerCase()} on the Relisted platform.
          {user.isSuspended && " Account is currently suspended."}
          Account created on {joinDate}.
        </Paragraph1>
      </div>

      {/* Profile Picture */}
      {avatarUpload && (
        <div className="bg-white hidden p-6 rounded-lg border border-gray-200">
          <Paragraph3 className="text-base font-bold mb-4 text-gray-900">
            Profile Picture
          </Paragraph3>
          <div className="bg-gray-100 rounded-lg p-8 mb-4 flex items-center justify-center h-56">
            <img
              src={avatarUpload.url}
              alt="Profile"
              className="max-h-full max-w-full object-contain rounded"
            />
          </div>
        </div>
      )}

      {/* Business Information */}
      {business && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Store size={20} className="text-gray-700" />
            <Paragraph3 className="text-base font-bold text-gray-900">
              Business Information
            </Paragraph3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Business Name
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-700">
                  {business.businessName || "N/A"}
                </Paragraph1>
              </div>
              <div>
                <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Category
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-700">
                  {business.businessCategory || "N/A"}
                </Paragraph1>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Business Phone
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-700">
                  {business.businessPhone || "N/A"}
                </Paragraph1>
              </div>
              <div>
                <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Business Email
                </Paragraph1>
                <Paragraph1 className="break-all text-sm text-gray-700">
                  {business.businessEmail || "N/A"}
                </Paragraph1>
              </div>
            </div>

            <div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Description
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700">
                {business.businessDescription || "N/A"}
              </Paragraph1>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  City
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-700">
                  {business.businessCity || "N/A"}
                </Paragraph1>
              </div>
              <div>
                <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  State
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-700">
                  {business.businessState || "N/A"}
                </Paragraph1>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Address Information */}
      {address && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={20} className="text-gray-700" />
            <Paragraph3 className="text-base font-bold text-gray-900">
              Address Information
            </Paragraph3>
          </div>

          <div className="space-y-4">
            <div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Street
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700">
                {address.street || "N/A"}
              </Paragraph1>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  City
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-700">
                  {address.city || "N/A"}
                </Paragraph1>
              </div>
              <div>
                <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  State
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-700">
                  {address.state || "N/A"}
                </Paragraph1>
              </div>
              <div>
                <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Country
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-700">
                  {address.country || "N/A"}
                </Paragraph1>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contact Information */}
      {emergency && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-gray-700" />
            <Paragraph3 className="text-base font-bold text-gray-900">
              Emergency Contact Information
            </Paragraph3>
          </div>
          <Paragraph1 className="text-xs text-gray-500 mb-4">
            Backup contact for emergency or account verification purposes.
          </Paragraph1>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Full Name
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-700">
                  {emergency.name || "N/A"}
                </Paragraph1>
              </div>
              <div>
                <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Relationship
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-700">
                  {emergency.relationship || "N/A"}
                </Paragraph1>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Phone Number
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-700">
                  {emergency.phoneNumber || "N/A"}
                </Paragraph1>
              </div>
              <div>
                <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  City
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-700">
                  {emergency.city || "N/A"}
                </Paragraph1>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  State
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-700">
                  {emergency.state || "N/A"}
                </Paragraph1>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
