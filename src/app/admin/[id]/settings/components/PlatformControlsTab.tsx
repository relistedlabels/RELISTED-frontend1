// ENDPOINTS: GET /api/admin/settings/platform-controls, PUT /api/admin/settings/platform-controls
"use client";

import { useState } from "react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { FormSkeleton } from "@/common/ui/SkeletonLoaders";
import { usePlatformControls } from "@/lib/queries/admin/useSettings";
import { useUpdatePlatformControls } from "@/lib/mutations/admin";

export default function PlatformControlsTab() {
  // API Query
  const { data: platformData, isLoading, error } = usePlatformControls();

  // Log errors to console only
  if (error) {
    console.error("Failed to load platform controls:", error);
  }

  const controls = platformData?.data;
  const showSkeleton = isLoading || error;

  // Local state for form changes
  const [commissionFees, setCommissionFees] = useState({
    platformCommission:
      controls?.commissionAndFees?.platformCommission?.toString() || "15",
    lateReturnFee:
      controls?.commissionAndFees?.lateReturnFee?.toString() || "5000",
    damageFee: controls?.commissionAndFees?.damageFee?.toString() || "50",
  });

  const [escrowPayoutRules, setEscrowPayoutRules] = useState({
    escrowReleaseDelay:
      controls?.escrowAndPayout?.escrowReleaseDelay || "24 Hours",
    minimumPayoutThreshold:
      controls?.escrowAndPayout?.minimumPayoutThreshold?.toString() || "10000",
  });

  const [kycRequirements, setKycRequirements] = useState({
    requireKycCurators: controls?.kycRequirements?.requireKycCurators ?? true,
    requireKycDressers: controls?.kycRequirements?.requireKycDressers ?? false,
  });

  const [platformAccess, setPlatformAccess] = useState({
    allowCuratorSignup: controls?.platformAccess?.allowCuratorSignup ?? true,
    allowDresserSignup: controls?.platformAccess?.allowDresserSignup ?? true,
  });

  const handleCommissionFeesChange = (field: string, value: string) => {
    setCommissionFees((prev) => ({ ...prev, [field]: value }));
  };

  const handleEscrowPayoutChange = (field: string, value: string) => {
    setEscrowPayoutRules((prev) => ({ ...prev, [field]: value }));
  };

  const handleKycToggle = (field: string) => {
    setKycRequirements((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
  };

  const handlePlatformAccessToggle = (field: string) => {
    setPlatformAccess((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
  };

  return (
    <div className="space-y-8">
      {showSkeleton ? (
        <>
          <FormSkeleton fields={5} />
          <FormSkeleton fields={5} />
          <FormSkeleton fields={5} />
        </>
      ) : (
        <>
          {/* Commission and Fees */}
          <div>
            <Paragraph3 className="text-gray-900 mb-6">
              Commission and Fees
            </Paragraph3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <Paragraph1 className="text-gray-600 font-medium mb-2">
                  Platform Commission (%)
                </Paragraph1>
                <input
                  type="number"
                  value={commissionFees.platformCommission}
                  onChange={(e) =>
                    handleCommissionFeesChange(
                      "platformCommission",
                      e.target.value,
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <Paragraph1 className="text-gray-600 font-medium mb-2">
                  Late Return Fee (₦)
                </Paragraph1>
                <input
                  type="number"
                  value={commissionFees.lateReturnFee}
                  onChange={(e) =>
                    handleCommissionFeesChange("lateReturnFee", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <Paragraph1 className="text-gray-600 font-medium mb-2">
                  Damage Fee (%)
                </Paragraph1>
                <input
                  type="number"
                  value={commissionFees.damageFee}
                  onChange={(e) =>
                    handleCommissionFeesChange("damageFee", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
            <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium">
              <Paragraph1>Save Changes</Paragraph1>
            </button>
          </div>

          {/* Escrow & Payout Rules */}
          <div>
            <Paragraph3 className="text-gray-900 mb-6">
              Escrow & Payout Rules
            </Paragraph3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Paragraph1 className="text-gray-600 font-medium mb-2">
                  Escrow Release Delay
                </Paragraph1>
                <input
                  type="text"
                  value={escrowPayoutRules.escrowReleaseDelay}
                  onChange={(e) =>
                    handleEscrowPayoutChange(
                      "escrowReleaseDelay",
                      e.target.value,
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <Paragraph1 className="text-gray-600 font-medium mb-2">
                  Minimum Payout Threshold (₦)
                </Paragraph1>
                <input
                  type="number"
                  value={escrowPayoutRules.minimumPayoutThreshold}
                  onChange={(e) =>
                    handleEscrowPayoutChange(
                      "minimumPayoutThreshold",
                      e.target.value,
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
            <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium">
              <Paragraph1>Save Changes</Paragraph1>
            </button>
          </div>

          {/* KYC Requirements */}
          <div>
            <Paragraph3 className="text-gray-900 mb-6">
              KYC Requirements
            </Paragraph3>
            <div className="space-y-4 mb-6">
              <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <Paragraph1 className="text-gray-900 font-medium">
                    Require KYC for Curators
                  </Paragraph1>
                  <Paragraph1 className="text-gray-500 text-sm mt-1">
                    Curators must complete KYC verification before listing items
                  </Paragraph1>
                </div>
                <button
                  onClick={() => handleKycToggle("requireKycCurators")}
                  className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${
                    kycRequirements.requireKycCurators
                      ? "bg-gray-900"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      kycRequirements.requireKycCurators
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <Paragraph1 className="text-gray-900 font-medium">
                    Require KYC for Dressers
                  </Paragraph1>
                  <Paragraph1 className="text-gray-500 text-sm mt-1">
                    Dressers must complete KYC verification before listing
                  </Paragraph1>
                </div>
                <button
                  onClick={() => handleKycToggle("requireKycDressers")}
                  className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${
                    kycRequirements.requireKycDressers
                      ? "bg-gray-900"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      kycRequirements.requireKycDressers
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
            <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium">
              <Paragraph1>Save Changes</Paragraph1>
            </button>
          </div>

          {/* Platform Access */}
          <div>
            <Paragraph3 className="text-gray-900 mb-6">
              Platform Access
            </Paragraph3>
            <div className="space-y-4 mb-6">
              <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <Paragraph1 className="text-gray-900 font-medium">
                    Allow Curator Sign-up
                  </Paragraph1>
                  <Paragraph1 className="text-gray-500 text-sm mt-1">
                    Enable new curators to register on the platform
                  </Paragraph1>
                </div>
                <button
                  onClick={() =>
                    handlePlatformAccessToggle("allowCuratorSignup")
                  }
                  className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${
                    platformAccess.allowCuratorSignup
                      ? "bg-gray-900"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      platformAccess.allowCuratorSignup
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <Paragraph1 className="text-gray-900 font-medium">
                    Allow Dresser Sign-up
                  </Paragraph1>
                  <Paragraph1 className="text-gray-500 text-sm mt-1">
                    Enable new dressers to register on the platform
                  </Paragraph1>
                </div>
                <button
                  onClick={() =>
                    handlePlatformAccessToggle("allowDresserSignup")
                  }
                  className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${
                    platformAccess.allowDresserSignup
                      ? "bg-gray-900"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      platformAccess.allowDresserSignup
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
            <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium">
              <Paragraph1>Save Changes</Paragraph1>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
