"use client";

import React from "react";
import {
  HiOutlineBuildingStorefront,
  HiOutlineTag,
  HiOutlineHeart,
} from "react-icons/hi2";
import { TiTick } from "react-icons/ti";
import { Paragraph1 } from "@/common/ui/Text"; // Assuming custom text components based on previous context
import RentalPeriods from "./RentalPeriods";
import { usePublicProductById } from "@/lib/queries/product/usePublicProductById";
import { DetailPanelSkeleton } from "@/common/ui/SkeletonLoaders";

// ============================================================================
// API ENDPOINTS USED:
// ============================================================================
// GET /api/public/products/:productId - Fetch product details including pricing
//   Returns: Daily rental price, security deposit, delivery fees, cleaning fees
//
// GET /api/renters/verifications/status - Check if user can place rental requests
//   Ensures renter has verified ID before allowing rental requests
// ============================================================================

interface UserProfileProps {
  name: string;
  rating: number;
  avatar?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ name, rating, avatar }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200  mt-4">
    <div className="flex items-center space-x-3">
      {/* Placeholder for User Image */}
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl text-gray-500">👤</span>
        )}
      </div>
      <div>
        <Paragraph1 className="text-sm font-semibold text-gray-900">
          {name.toUpperCase()}
        </Paragraph1>
        <div className="flex items-center  text-yellow-500">
          <span aria-label={`${rating} star rating`}>
            {"★".repeat(Math.floor(rating))}
            {"☆".repeat(5 - Math.floor(rating))}
          </span>
          <span className="text-gray-600 ml-1 text-[10px]">{rating}</span>
        </div>
      </div>
    </div>
    <a
      href="/curator-profile"
      className=" font-semibold text-gray-900 hover:text-gray-700"
    >
      VIEW PROFILE
    </a>
  </div>
);

interface RentalDetailsCardProps {
  productId: string;
}

const RentalDetailsCard: React.FC<RentalDetailsCardProps> = ({ productId }) => {
  const { data: product, isLoading } = usePublicProductById(productId);

  if (isLoading || !product) {
    return <DetailPanelSkeleton />;
  }

  return (
    <div className="font-sans">
      <div className=" p-4 py-6 border border-gray-200 bg-[#FBFBFB] rounded-xl ">
        {/* Rental and Item Value Section */}
        <div className="space-y-4 mb-6">
          {/* Rental Fee */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-700">
              <HiOutlineBuildingStorefront className="w-5 h-5" />
              <Paragraph1 className="text-sm">Daily Rental</Paragraph1>
            </div>
            <Paragraph1 className="text-lg font-bold text-gray-900">
              ₦{product.dailyPrice.toLocaleString()}
            </Paragraph1>
          </div>

          {/* Item Value */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-700">
              <HiOutlineTag className="w-5 h-5" />
              <Paragraph1 className="text-sm">Security Deposit:</Paragraph1>
            </div>
            <div className="flex items-center space-x-2">
              <Paragraph1 className="text-sm text-gray-500">
                (Refundable)
              </Paragraph1>
              <Paragraph1 className="text-lg font-bold text-gray-900">
                ₦
                {product.securityDeposit
                  ? product.securityDeposit.toLocaleString()
                  : "0"}
              </Paragraph1>
            </div>
          </div>
        </div>

        {/* Rental Duration Selection */}
        <div className="mb-6">
          <Paragraph1 className="text-sm font-medium text-gray-900 mb-2">
            Rental Duration
          </Paragraph1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {/* Active Button */}
            <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg transition duration-150">
              <Paragraph1>3 Days</Paragraph1>
            </button>
            {/* Inactive Buttons */}
            <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-800 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition duration-150">
              <Paragraph1>6 Days</Paragraph1>
            </button>
            <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-800 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition duration-150">
              <Paragraph1>9 Days</Paragraph1>
            </button>
            <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-800 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition duration-150">
              <Paragraph1>Custom</Paragraph1>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-4">
          <RentalPeriods />
          <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150">
            <HiOutlineHeart className="w-6 h-6 text-gray-800" />
          </button>
        </div>

        {/* Security / Deposit Info */}
        <div className="p-3 bg-white border border-gray-200 rounded-lg flex items-start space-x-2 mb-4">
          {/* <TiTick className="w-5 h-5 text-green-600 mt-0.5 shrink-0" /> */}
          <img src="/icons/safe1.svg" alt="safe" />
          <Paragraph1 className=" text-gray-700 leading-snug">
            Your deposit is secure and fully refunded after item return and
            approval.
          </Paragraph1>
        </div>

        {/* Cleaning Fees Note */}
        <Paragraph1 className=" text-center text-gray-500 mt-2 pb-2">
          Delivery and cleaning fees calculated at checkout
        </Paragraph1>
      </div>

      {/* User Profile Card */}
      <UserProfile
        name={product.lister.name}
        rating={product.lister.rating}
        avatar={product.lister.avatar}
      />
    </div>
  );
};

export default RentalDetailsCard;
