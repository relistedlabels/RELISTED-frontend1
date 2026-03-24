// ENDPOINTS: GET /api/public/users/:userId

"use client";

import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineCalendar, HiOutlineShieldCheck } from "react-icons/hi2";
import { TiTick } from "react-icons/ti";
import { DetailPanelSkeleton } from "@/common/ui/SkeletonLoaders";
import { usePublicUserById } from "@/lib/queries/user/usePublicUserById";
import Link from "next/link";

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
          <div className="space-y-6">
            {user.shopPolicies.returnPolicy && (
              <div>
                <Paragraph1 className="text-sm font-semibold text-gray-900 mb-3">
                  Return Policy
                </Paragraph1>
                {/* <Paragraph1 className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {user.shopPolicies.returnPolicy}
                </Paragraph1> */}
                <Paragraph1 className="text-sm text-gray-600 bg-gray-50 p-3 rounded mb-3 leading-relaxed">
                  Items must be returned on the agreed rental end date through
                  our logistics partner Topship. The vendor will inspect the
                  item's condition upon return. Your collateral will be released
                  if no issues are identified. We evaluate returns based on
                  acceptable wear (light wrinkles, minor fabric softening)
                  versus damage (permanent stains, tears, broken closures,
                  missing embellishments). Normal wear from responsible use is
                  expected and does not qualify as damage.
                </Paragraph1>
                <Link
                  href="/terms-and-conditions#return-process"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                >
                  Learn more →
                </Link>
              </div>
            )}
            {user.shopPolicies.deliveryTime && (
              <div>
                <Paragraph1 className="text-sm font-semibold text-gray-900 mb-3">
                  Delivery Time
                </Paragraph1>
                {/* <Paragraph1 className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {user.shopPolicies.deliveryTime}
                </Paragraph1> */}
                <Paragraph1 className="text-sm text-gray-600 bg-gray-50 p-3 rounded mb-3 leading-relaxed">
                  Once your rental request is confirmed, Topship will collect
                  the item from the vendor and deliver it to you. Delivery
                  timelines depend on your location and our logistics schedules.
                  The vendor ships through our trusted logistics provider
                  Topship, which handles all item collection and delivery. We
                  are not responsible for delays caused by third-party logistics
                  providers, but we work to ensure smooth transfers.
                </Paragraph1>
                <Link
                  href="/terms-and-conditions#delivery-process"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                >
                  Learn more →
                </Link>
              </div>
            )}
            {user.shopPolicies.cancellationPolicy && (
              <div>
                <Paragraph1 className="text-sm font-semibold text-gray-900 mb-3">
                  Cancellation Policy
                </Paragraph1>
                {/* <Paragraph1 className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {user.shopPolicies.cancellationPolicy}
                </Paragraph1> */}
                <Paragraph1 className="text-sm text-gray-600 bg-gray-50 p-3 rounded mb-3 leading-relaxed">
                  Late returns are subject to fees to protect vendors. If an
                  item is returned late, 10% of the collateral value will be
                  deducted for each day the item is overdue. This continues
                  daily until the item is returned or the collateral value is
                  fully exhausted. Additionally, if an item is lost, not
                  returned, or returned in unusable condition, the full
                  collateral amount may be forfeited to compensate the vendor.
                </Paragraph1>
                <Link
                  href="/terms-and-conditions#cancellation-refund"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                >
                  Learn more →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CuratorAboutDetails;
