// ENDPOINTS: GET /api/admin/users/:userId
"use client";

import React, { useState } from "react";
import {
  Download,
  Eye,
  CheckCircle,
  Shield,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Store,
} from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import DocumentModal from "./DocumentModal";

interface UserProfileOverviewProps {
  user: any;
}

export default function UserProfileOverview({
  user,
}: UserProfileOverviewProps) {
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

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
  const ninUpload = profile?.ninUpload;

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return (
    <div className=" flex flex-col gap-4">
      <DocumentModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        documentData={{
          title: "KYC Document",
          documentType: profile?.idDocumentType || "National ID",
          idNumber: profile?.nin || profile?.bvn,
          expiryDate: "N/A",
          image: ninUpload?.url || "https://i.pravatar.cc/150?img=0",
        }}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Account Status
          </Paragraph1>
          <Paragraph3 className="text-lg font-bold text-gray-900">
            {user.isSuspended ? "Suspended" : "Active"}
          </Paragraph3>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Verification Status
          </Paragraph1>
          <Paragraph3 className="text-lg font-bold text-gray-900">
            {user.isVerified ? "Verified" : "Not Verified"}
          </Paragraph3>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
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
          {user.name} is a {user.role.toLowerCase()} on the Relisted platform.
          {user.isVerified && " Account has been verified."}
          {user.isSuspended && " Account is currently suspended."}
          Account created on {joinDate}.
        </Paragraph1>
      </div>

      {/* Personal Information */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={20} className="text-gray-700" />
          <Paragraph3 className="text-base font-bold text-gray-900">
            Personal Information
          </Paragraph3>
          <span className="ml-auto flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
            <CheckCircle size={14} />
            {profile?.isApproved ? "Verified" : "Pending"}
          </span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Full Name
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700">
                {user.name}
              </Paragraph1>
            </div>
            <div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Email
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700">
                {user.email}
              </Paragraph1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Phone Number
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700">
                {profile?.phoneNumber || "N/A"}
              </Paragraph1>
            </div>
            <div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                User Role
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700">
                {user.role}
              </Paragraph1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                NIN
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700">
                {profile?.nin || "N/A"}
              </Paragraph1>
            </div>
            <div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                BVN
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700">
                {profile?.bvn || "N/A"}
              </Paragraph1>
            </div>
          </div>
        </div>
      </div>

      {/* NIN Document Upload */}
      {ninUpload && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <Paragraph3 className="text-base font-bold mb-4 text-gray-900">
            NIN Document Preview
          </Paragraph3>
          <div className="bg-gray-100 rounded-lg p-8 mb-4 flex items-center justify-center h-56">
            <img
              src={ninUpload.url}
              alt="NIN Document"
              className="max-h-full max-w-full object-contain rounded"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsDocumentModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm text-gray-700"
            >
              <Eye size={18} />
              View Full Image
            </button>
            <a
              href={avatarUpload.url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm text-gray-700"
            >
              <Download size={18} />
              Download
            </a>
          </div>
        </div>
      )}

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
            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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
                <Paragraph1 className="text-sm text-gray-700">
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-3 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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
