// ENDPOINTS: GET /api/listers/profile/business, PUT /api/listers/profile/business
"use client";

import React, { useEffect, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  HiOutlineBriefcase,
  HiOutlineTag,
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlineGlobeAlt,
  HiOutlinePhone,
  HiOutlineEnvelope,
} from "react-icons/hi2";
import { useBusinessProfile } from "@/lib/queries/listers/useBusinessProfile";
import { useUpdateBusinessProfile } from "@/lib/mutations/listers/useUpdateBusinessProfile";

const BusinessDetailsForm: React.FC = () => {
  const { data } = useBusinessProfile();
  const updateBusinessProfileMutation = useUpdateBusinessProfile();

  const [formData, setFormData] = useState({
    businessName: "",
    businessCategory: "Fashion & Accessories",
    businessDescription: "",
    businessAddress: "",
    businessEmail: "",
    businessPhone: "",
    taxId: "",
    website: "",
    businessRegistration: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  // Populate from backend /listers/profile/business when available
  useEffect(() => {
    const businessProfile = data?.data.businessProfile;
    if (!businessProfile) return;

    setFormData((prev) => ({
      ...prev,
      businessName: businessProfile.businessName || "",
      businessCategory:
        businessProfile.businessCategory || "Fashion & Accessories",
      businessDescription: businessProfile.businessDescription || "",
      businessAddress: businessProfile.businessAddress || "",
      businessEmail: businessProfile.businessEmail || "",
      businessPhone: businessProfile.businessPhone || "",
      website: businessProfile.website || "",
      taxId: businessProfile.taxId || "",
      businessRegistration: businessProfile.businessRegistration || "",
    }));
  }, [data]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const businessProfile = data?.data.businessProfile;
    if (!businessProfile) return;

    updateBusinessProfileMutation.mutate(
      {
        businessName: formData.businessName || businessProfile.businessName,
        businessCategory:
          formData.businessCategory || businessProfile.businessCategory,
        businessDescription:
          formData.businessDescription || businessProfile.businessDescription,
        businessEmail: formData.businessEmail || businessProfile.businessEmail,
        businessPhone: formData.businessPhone || businessProfile.businessPhone,
        businessAddress:
          formData.businessAddress || businessProfile.businessAddress,
        website: formData.website || businessProfile.website,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  return (
    <div className="font-sans">
      {/* Header */}
      <Paragraph1 className="text-lg font-bold uppercase text-gray-900 mb-6">
        Business Details
      </Paragraph1>

      <div className="space-y-6">
        {/* Business Name & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Business Name */}
          <div>
            <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
              Business Name *
            </Paragraph1>
            <div className="relative">
              <HiOutlineBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) =>
                  handleInputChange("businessName", e.target.value)
                }
                disabled={!isEditing}
                placeholder="Your business name"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Business Category */}
          <div>
            <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
              Business Category *
            </Paragraph1>
            <div className="relative">
              <HiOutlineTag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={formData.businessCategory}
                onChange={(e) =>
                  handleInputChange("businessCategory", e.target.value)
                }
                disabled={!isEditing}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black focus:border-black transition disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed appearance-none"
              >
                <option>Fashion & Accessories</option>
                <option>Jewelry</option>
                <option>Luxury Goods</option>
                <option>Vintage Items</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Business Description */}
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            Business Description
          </Paragraph1>
          <div className="relative">
            <HiOutlineDocumentText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              value={formData.businessDescription}
              onChange={(e) =>
                handleInputChange("businessDescription", e.target.value)
              }
              disabled={!isEditing}
              placeholder="Describe your business and what you offer..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed min-h-[100px]"
            />
          </div>
        </div>

        {/* Contact Information */}
        <Paragraph1 className="text-lg font-bold text-gray-900 mt-8 mb-4">
          Contact Information
        </Paragraph1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Business Email */}
          <div>
            <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
              Business Email *
            </Paragraph1>
            <div className="relative">
              <HiOutlineEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.businessEmail}
                onChange={(e) =>
                  handleInputChange("businessEmail", e.target.value)
                }
                disabled={!isEditing}
                placeholder="business@example.com"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Business Phone */}
          <div>
            <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
              Business Phone *
            </Paragraph1>
            <div className="relative">
              <HiOutlinePhone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.businessPhone}
                onChange={(e) =>
                  handleInputChange("businessPhone", e.target.value)
                }
                disabled={!isEditing}
                placeholder="+234 (0) 907 123 4567"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Business Address */}
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            Business Address *
          </Paragraph1>
          <div className="relative">
            <HiOutlineHome className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.businessAddress}
              onChange={(e) =>
                handleInputChange("businessAddress", e.target.value)
              }
              disabled={!isEditing}
              placeholder="Business street address"
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Business Website & Legal Information */}
        <Paragraph1 className="text-lg font-bold text-gray-900 mt-8 mb-4">
          Legal & Online Presence
        </Paragraph1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Website */}
          <div>
            <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
              Website (Optional)
            </Paragraph1>
            <div className="relative">
              <HiOutlineGlobeAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                disabled={!isEditing}
                placeholder="www.yourbusiness.com"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Tax ID */}
          <div>
            <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
              Tax ID / NIN *
            </Paragraph1>
            <div className="relative">
              <HiOutlineTag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => handleInputChange("taxId", e.target.value)}
                disabled={true}
                placeholder="Tax identification number"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            <Paragraph1 className="text-xs text-gray-500 mt-1">
              This cannot be changed after verification
            </Paragraph1>
          </div>
        </div>

        {/* Business Registration */}
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            Business Registration Number *
          </Paragraph1>
          <div className="relative">
            <HiOutlineDocumentText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.businessRegistration}
              onChange={(e) =>
                handleInputChange("businessRegistration", e.target.value)
              }
              disabled={true}
              placeholder="CAC or registration number"
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <Paragraph1 className="text-xs text-gray-500 mt-1">
            Verified and locked for security
          </Paragraph1>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row justify-end pt-8 mt-8 border-t border-gray-200">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition duration-150"
          >
            Edit Business Details
          </button>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 text-sm font-semibold text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition duration-150"
            >
              Save Changes
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BusinessDetailsForm;
