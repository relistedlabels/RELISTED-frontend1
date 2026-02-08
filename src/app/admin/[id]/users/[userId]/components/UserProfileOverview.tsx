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
} from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import DocumentModal from "./DocumentModal";

interface User {
  name: string;
  walletBalance: string;
  totalRentals: number;
  activeDisputes: number;
  joinDate: string;
  kyc: {
    fullName: string;
    nin: string;
    dateOfBirth?: string;
    id: string;
    bvn: string;
    status?: string;
  };
  emergencyContact: {
    fullName: string;
    relationship: string;
    phone: string;
    address: string;
  };
  email: string;
  phone: string;
}

interface UserProfileOverviewProps {
  user: User;
}

export default function UserProfileOverview({
  user,
}: UserProfileOverviewProps) {
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  return (
    <div className=" flex flex-col gap-4">
      <DocumentModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        documentData={{
          title: "Identity Document",
          documentType: "National ID Card",
          idNumber: user.kyc.id,
          expiryDate: "August 2029",
          image:
            "https://images.unsplash.com/photo-1570303008347-89a1e76eb0f4?w=400&h=500&fit=crop",
        }}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Wallet Balance
          </Paragraph1>
          <Paragraph3 className="text-2xl font-bold text-gray-900">
            {user.walletBalance}
          </Paragraph3>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Total Rentals
          </Paragraph1>
          <Paragraph3 className="text-2xl font-bold text-gray-900">
            {user.totalRentals}
          </Paragraph3>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Active Disputes
          </Paragraph1>
          <Paragraph3 className="text-2xl font-bold text-gray-900">
            {user.activeDisputes}
          </Paragraph3>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Member Since
          </Paragraph1>
          <Paragraph3 className="text-2xl font-bold text-gray-900">
            {user.joinDate}
          </Paragraph3>
        </div>
      </div>

      {/* Account Overview */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <Paragraph3 className="text-base font-bold mb-3 text-gray-900">
          Account Overview
        </Paragraph3>
        <Paragraph1 className="text-sm text-gray-600 leading-relaxed">
          {user.name} is an active dresser on the Relisted platform. They have
          completed {user.totalRentals} rentals with a current wallet balance of{" "}
          {user.walletBalance}. Account created on {user.joinDate}. Currently
          has {user.activeDisputes} open disputes.
        </Paragraph1>
      </div>

      {/* KYC Information */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={20} className="text-gray-700" />
          <Paragraph3 className="text-base font-bold text-gray-900">
            KYC Information
          </Paragraph3>
          <span className="ml-auto flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
            <CheckCircle size={14} />
            Verified
          </span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Full Address
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700">
                454 Victoria Street, Lekki Phase 1, Lagos
              </Paragraph1>
            </div>
            <div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                ID
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700">
                {user.kyc.id}
              </Paragraph1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Means of Identification
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700">
                National ID Card
              </Paragraph1>
            </div>
            <div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                ID Number
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700">
                {user.kyc.nin}
              </Paragraph1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                ID Expiry Date
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700">
                August 2025
              </Paragraph1>
            </div>
            <div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Verification Status
              </Paragraph1>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                <CheckCircle size={14} />
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Document Preview */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <Paragraph3 className="text-base font-bold mb-4 text-gray-900">
          Uploaded Document Preview
        </Paragraph3>
        <Paragraph1 className="text-xs text-gray-500 mb-4">
          Click "Download to view full document or use the button below.
        </Paragraph1>

        <div className="bg-gray-100 rounded-lg p-8 mb-4 flex items-center justify-center h-56">
          <img
            src="https://images.unsplash.com/photo-1570303008347-89a1e76eb0f4?w=200&h=200&fit=crop"
            alt="Document"
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsDocumentModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm text-gray-700"
          >
            <Eye size={18} />
            View Full Document
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm text-gray-700">
            <Download size={18} />
            Download
          </button>
        </div>
      </div>

      {/* Emergency Contact Information */}
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
                {user.emergencyContact.fullName}
              </Paragraph1>
            </div>
            <div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Relationship
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700">
                {user.emergencyContact.relationship}
              </Paragraph1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Phone Number
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700">
                {user.emergencyContact.phone}
              </Paragraph1>
            </div>
            <div>
              <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Address
              </Paragraph1>
              <Paragraph1 className="text-sm text-gray-700">
                {user.emergencyContact.address}
              </Paragraph1>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <Paragraph3 className="text-base font-bold mb-4 text-gray-900">
          Contact Information
        </Paragraph3>

        <div className="space-y-4">
          <div>
            <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
              <Mail size={14} />
              Email Address
            </Paragraph1>
            <Paragraph1 className="text-sm text-gray-700">
              {user.email}
            </Paragraph1>
          </div>

          <div>
            <Paragraph1 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
              <Phone size={14} />
              Phone Number
            </Paragraph1>
          </div>
        </div>
      </div>
    </div>
  );
}
