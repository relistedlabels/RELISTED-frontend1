// ENDPOINTS: GET /api/public/users/:userId

"use client";

import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineCalendar, HiOutlineShieldCheck } from "react-icons/hi2";
import { TiTick } from "react-icons/ti";
import { DetailPanelSkeleton } from "@/common/ui/SkeletonLoaders";
import { usePublicUserById } from "@/lib/queries/user/usePublicUserById";

interface CuratorAboutDetailsProps {
  userId: string;
}

const CuratorAboutDetails: React.FC<CuratorAboutDetailsProps> = ({
  userId,
}) => {
  const { data: user, isLoading, error } = usePublicUserById(userId);

  if (isLoading) {
    return <DetailPanelSkeleton />;
  }

  if (error || !user) {
    return (
      <div className="font-sans p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        <Paragraph1 className="text-red-600">
          Failed to load curator information.
        </Paragraph1>
      </div>
    );
  }

  const memberSince = new Date(user.joined);

  return (
    <div className="font-sans p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
      {user.shopDescription && (
        <div className="mb-6">
          <Paragraph1 className="text-base font-semibold text-gray-900 mb-2">
            Shop Description
          </Paragraph1>
          <Paragraph1 className="text-sm text-gray-700 leading-relaxed">
            {user.shopDescription}
          </Paragraph1>
        </div>
      )}

      <Paragraph1 className="text-base font-semibold text-gray-900 mb-6">
        About the Curator
      </Paragraph1>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
        <div className="space-y-4 flex-1">
          <div className="flex items-center space-x-3">
            <HiOutlineCalendar className="w-5 h-5 text-gray-500 shrink-0" />
            <div>
              <Paragraph1 className="text-xs text-gray-500">
                Member Since
              </Paragraph1>
              <Paragraph1 className="text-sm font-semibold text-gray-900">
                {memberSince.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </Paragraph1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <HiOutlineShieldCheck className="w-5 h-5 text-gray-500 shrink-0" />
            <div>
              <Paragraph1 className="text-xs text-gray-500">
                Verification Status
              </Paragraph1>
              <div className="flex items-center">
                <Paragraph1
                  className={`text-sm font-semibold ${user.isVerified ? "text-green-600" : "text-gray-500"}`}
                >
                  {user.isVerified ? "Verified Curator" : "Unverified"}
                </Paragraph1>
                {user.isVerified && (
                  <span className="ml-1 inline-flex items-center p-0.5 rounded-full text-white bg-yellow-500">
                    <TiTick className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 border border-gray-100 rounded-lg bg-gray-50">
          <Paragraph1 className="text-base font-semibold text-gray-900 mb-4">
            Statistics
          </Paragraph1>
          <div className="space-y-3">
            <div>
              <Paragraph1 className="text-xs text-gray-500">
                Total Items Listed
              </Paragraph1>
              <Paragraph1 className="text-lg font-bold text-gray-900">
                {user.itemCount || 0}
              </Paragraph1>
            </div>
            <div>
              <Paragraph1 className="text-xs text-gray-500">
                Average Rating
              </Paragraph1>
              <div className="flex items-center space-x-2">
                <Paragraph1 className="text-lg font-bold text-gray-900">
                  {user.rating || 0}
                </Paragraph1>
                <span className="text-yellow-500">
                  {"★".repeat(Math.floor(user.rating || 0))}
                  {"☆".repeat(5 - Math.floor(user.rating || 0))}
                </span>
              </div>
            </div>
            <div>
              <Paragraph1 className="text-xs text-gray-500">
                Customer Reviews
              </Paragraph1>
              <Paragraph1 className="text-lg font-bold text-gray-900">
                {user.reviewCount || 0}
              </Paragraph1>
            </div>
          </div>
        </div>
      </div>

      {user.shopPolicies && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Paragraph1 className="text-base font-semibold text-gray-900 mb-4">
            Shop Policies
          </Paragraph1>
          <div className="space-y-4">
            {user.shopPolicies.returnPolicy && (
              <div>
                <Paragraph1 className="text-sm font-semibold text-gray-900">
                  Return Policy
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-700">
                  {user.shopPolicies.returnPolicy}
                </Paragraph1>
              </div>
            )}
            {user.shopPolicies.deliveryTime && (
              <div>
                <Paragraph1 className="text-sm font-semibold text-gray-900">
                  Delivery Time
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-700">
                  {user.shopPolicies.deliveryTime}
                </Paragraph1>
              </div>
            )}
            {user.shopPolicies.cancellationPolicy && (
              <div>
                <Paragraph1 className="text-sm font-semibold text-gray-900">
                  Cancellation Policy
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-700">
                  {user.shopPolicies.cancellationPolicy}
                </Paragraph1>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CuratorAboutDetails;
