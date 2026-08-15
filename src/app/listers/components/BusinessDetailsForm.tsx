// ENDPOINTS: GET /api/listers/profile/business, PUT /api/listers/profile/business
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Paragraph1 } from "@/common/ui/Text";
import { toast } from "sonner";
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
import type { UpdateBusinessProfilePayload } from "@/lib/api/listers";

const BusinessDetailsForm: React.FC = () => {
  const searchParams = useSearchParams();
  const { data } = useBusinessProfile();
  const updateBusinessProfileMutation = useUpdateBusinessProfile();
  const businessProfile = data?.data.businessProfile;

  const isOnboardingProfileTask =
    searchParams.get("onboardingTask") === "lister-profile";
  const isOnboardingBusinessStep = useMemo(
    () =>
      isOnboardingProfileTask &&
      (searchParams.get("tab") === "business" ||
        searchParams.get("taskStep") === "2"),
    [isOnboardingProfileTask, searchParams],
  );

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

  useEffect(() => {
    if (isOnboardingBusinessStep) {
      setIsEditing(true);
    }
  }, [isOnboardingBusinessStep]);

  const fieldsEnabled = isEditing || isOnboardingBusinessStep;

  // Populate from backend /listers/profile/business when available
  useEffect(() => {
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
  }, [businessProfile]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.businessName.trim()) {
      toast.error("Please enter a business name.");
      return;
    }

    const payload: UpdateBusinessProfilePayload = {
      businessName: formData.businessName.trim(),
    };

    if (formData.businessCategory.trim()) {
      payload.businessCategory = formData.businessCategory;
    }
    if (formData.businessDescription.trim()) {
      payload.businessDescription = formData.businessDescription.trim();
    }
    if (formData.businessEmail.trim()) {
      payload.businessEmail = formData.businessEmail.trim();
    }
    if (formData.businessPhone.trim()) {
      payload.businessPhone = formData.businessPhone.trim();
    }
    if (formData.businessAddress.trim()) {
      payload.businessAddress = formData.businessAddress.trim();
    }
    if (formData.website.trim()) {
      payload.website = formData.website.trim();
    }

    updateBusinessProfileMutation.mutate(payload, {
        onSuccess: () => {
          if (!isOnboardingProfileTask) {
            setIsEditing(false);
          }
          toast.success("Business details updated successfully!", {
            description: "Your business information has been saved.",
            duration: 4000,
          });
        },
        onError: (error: unknown) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to update business details. Please try again.";
          toast.error("Update Failed", {
            description: errorMessage,
            duration: 4000,
          });
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
          <div data-onboarding-target="lister-business-name">
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
                disabled={!fieldsEnabled}
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
                disabled={!fieldsEnabled}
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
                disabled={!fieldsEnabled}
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
                disabled={!fieldsEnabled}
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
                disabled={!fieldsEnabled}
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
                disabled={!fieldsEnabled}
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
                disabled={!fieldsEnabled}
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
                disabled={!fieldsEnabled}
                placeholder="Tax identification number"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
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
                disabled={!fieldsEnabled}
              placeholder="CAC or registration number"
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
            />
          </div>
          <Paragraph1 className="text-xs text-gray-500 mt-1">
            Verified and locked for security
          </Paragraph1>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="flex flex-col gap-3 sm:flex-row justify-end pt-8 mt-8 border-t border-gray-200"
        data-onboarding-target="lister-business-save"
      >
        {!fieldsEnabled ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition duration-150"
          >
            Edit Business Details
          </button>
        ) : (
          <>
            {!isOnboardingBusinessStep ? (
              <button
                onClick={() => setIsEditing(false)}
                disabled={updateBusinessProfileMutation.isPending}
                className="px-6 py-2 text-sm font-semibold text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            ) : null}
            <button
              onClick={handleSave}
              disabled={updateBusinessProfileMutation.isPending}
              className="px-6 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {updateBusinessProfileMutation.isPending ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BusinessDetailsForm;
