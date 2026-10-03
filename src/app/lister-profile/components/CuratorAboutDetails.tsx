// ENDPOINTS: GET /api/public/users/:userId

"use client";

import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  HiOutlineCalendar,
  HiOutlineShieldCheck,
  HiOutlineMapPin,
  HiOutlineTag,
} from "react-icons/hi2";
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
          Failed to load lister information.
        </Paragraph1>
      </div>
    );
  }

  const memberSince = new Date(user.joined);
  const hasShopPolicies =
    user.shopPolicies &&
    (user.shopPolicies.returnPolicy ||
      user.shopPolicies.deliveryTime ||
      user.shopPolicies.cancellationPolicy);

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
        About the Lister
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
                  {user.isVerified ? "Verified Lister" : "Unverified"}
                </Paragraph1>
                {user.isVerified && (
                  <span className="ml-1 inline-flex items-center p-0.5 rounded-full text-white bg-yellow-500">
                    <TiTick className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          </div>

          {user.businessCategory && (
            <div className="flex items-center space-x-3">
              <HiOutlineTag className="w-5 h-5 text-gray-500 shrink-0" />
              <div>
                <Paragraph1 className="text-xs text-gray-500">Category</Paragraph1>
                <Paragraph1 className="text-sm font-semibold text-gray-900">
                  {user.businessCategory}
                </Paragraph1>
              </div>
            </div>
          )}

          {user.location && (
            <div className="flex items-center space-x-3">
              <HiOutlineMapPin className="w-5 h-5 text-gray-500 shrink-0" />
              <div>
                <Paragraph1 className="text-xs text-gray-500">Location</Paragraph1>
                <Paragraph1 className="text-sm font-semibold text-gray-900">
                  {user.location}
                </Paragraph1>
              </div>
            </div>
          )}
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
              {user.reviewCount > 0 ? (
                <div className="flex items-center space-x-2">
                  <Paragraph1 className="text-lg font-bold text-gray-900">
                    {user.rating.toFixed(1)}
                  </Paragraph1>
                  <span className="text-yellow-500">
                    {"★".repeat(Math.floor(user.rating))}
                    {"☆".repeat(5 - Math.floor(user.rating))}
                  </span>
                </div>
              ) : (
                <Paragraph1 className="text-sm text-gray-500">
                  No reviews yet
                </Paragraph1>
              )}
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

      {hasShopPolicies && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Paragraph1 className="text-base font-semibold text-gray-900 mb-4">
            Shop Policies
          </Paragraph1>
          <div className="space-y-6">
            {user.shopPolicies?.returnPolicy && (
              <div>
                <Paragraph1 className="text-sm font-semibold text-gray-900 mb-3">
                  Return Policy
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-600 bg-gray-50 p-3 rounded leading-relaxed">
                  {user.shopPolicies.returnPolicy}
                </Paragraph1>
              </div>
            )}
            {user.shopPolicies?.deliveryTime && (
              <div>
                <Paragraph1 className="text-sm font-semibold text-gray-900 mb-3">
                  Delivery Time
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-600 bg-gray-50 p-3 rounded leading-relaxed">
                  {user.shopPolicies.deliveryTime}
                </Paragraph1>
              </div>
            )}
            {user.shopPolicies?.cancellationPolicy && (
              <div>
                <Paragraph1 className="text-sm font-semibold text-gray-900 mb-3">
                  Cancellation Policy
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-600 bg-gray-50 p-3 rounded leading-relaxed">
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
