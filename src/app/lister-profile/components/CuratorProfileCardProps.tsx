// ENDPOINTS: GET /api/public/users/:userId

"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text"; // Using your custom text component
import { HiOutlineShare, HiOutlineChevronLeft } from "react-icons/hi2";
import { TiTick } from "react-icons/ti"; // Using the Tick icon for the Verified badge
import { FaInstagram, FaGlobe } from "react-icons/fa"; // Using Fa icons for social media
import BackButton from "@/common/ui/BackButton";
import { usePublicUserById } from "@/lib/queries/user/usePublicUserById";
import { ProfileCardSkeleton } from "@/common/ui/SkeletonLoaders";

interface CuratorProfileCardProps {
  userId: string;
}

const CuratorProfileCard: React.FC<CuratorProfileCardProps> = ({ userId }) => {
  const { data: user, isLoading, error } = usePublicUserById(userId);

  if (isLoading) {
    return <ProfileCardSkeleton />;
  }

  if (error || !user) {
    return (
      <div className="font-sans bg-white p-4 sm:p-6 rounded-xl border mt-8 border-gray-200">
        <Paragraph1 className="text-gray-700">Profile not found</Paragraph1>
      </div>
    );
  }

  // Function to render the star icons
  const renderStars = (rate: number) => {
    return (
      <span
        className="text-yellow-500 text-lg"
        aria-label={`${rate} star rating`}
      >
        {"★".repeat(Math.floor(rate))}
        {"☆".repeat(5 - Math.floor(rate))}
      </span>
    );
  };

  return (
    <div className="font-sans bg-white p-4 sm:p-6 rounded-xl border mt-8 border-gray-200">
      {/* Header (Back button and Share button) */}
      <div className="flex items-center justify-between mb-4 ">
        <div className="flex items-center space-x-2">
          <BackButton />
          <Paragraph3 className=" font-bold text-gray-900">
            Lister's Profile
          </Paragraph3>
        </div>
        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-150">
          <HiOutlineShare className="w-5 h-5 text-gray-800" />
        </button>
      </div>

      {/* Profile Details */}
      <div className="flex space-x-4">
        {/* Avatar */}
        <div className="w-12 h-12 sm:w-30 sm:h-30 rounded-full overflow-hidden bg-gray-200 shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.name} avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl text-gray-500 flex items-center justify-center h-full">
              👤
            </span>
          )}
        </div>

        {/* Text Content */}
        <div className="grow">
          <div className="flex items-center space-x-2 mb-1">
            <Paragraph1 className="text-lg font-bold text-gray-900">
              {user.name}
            </Paragraph1>
            {user.isVerified && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <TiTick className="w-3 h-3 mr-0.5" />
                Verified
              </span>
            )}
          </div>

          <Paragraph1 className="text-sm text-gray-700 leading-snug mb-3">
            {user.bio || user.shopDescription || "Luxury fashion curator"}
          </Paragraph1>

          {/* Social Links */}
          <div className="flex items-center space-x-4 mb-4">
            {/* You can extend this with social links from the API */}
          </div>

          <hr className=" text-gray-200 pb-4" />
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {" "}
            <div className=" items-center flex gap-1">
              {" "}
              {renderStars(user.rating)}
              <Paragraph1 className="text-sm font-semibold text-gray-900">
                {user.rating.toFixed(1)}
              </Paragraph1>
            </div>
            <Paragraph1 className="text-sm text-gray-500">
              ({user.reviewCount} reviews)
            </Paragraph1>
            <Paragraph1 className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
              {user.itemCount} Listings
            </Paragraph1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuratorProfileCard;
