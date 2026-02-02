import React from "react";
import { Paragraph1, ParagraphLink1 } from "@/common/ui/Text"; // Using your custom text component
import {
  HiOutlineMapPin,
  HiOutlineCalendar,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import { TiTick } from "react-icons/ti";
import { SlidersVertical, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CuratorAboutDetailsProps {
  location: string;
  memberSinceYear: number;
  verificationStatus: "Verified Curator" | "Unverified";
  totalListings: number;
  completedRentals: number;
  averageRating: number;
  maxRating: number; // Typically 5.0
}

const CuratorAboutDetails: React.FC<CuratorAboutDetailsProps> = ({
  location,
  memberSinceYear,
  verificationStatus,
  totalListings,
  completedRentals,
  averageRating,
  maxRating,
}) => {
  const isVerified = verificationStatus === "Verified Curator";

  return (
    <div className="font-sans p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Header */}
      <Paragraph1 className="text-base font-semibold text-gray-900 mb-6">
        About the Curator
      </Paragraph1>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
        {/* Left Column: Basic Details */}
        <div className="space-y-4 flex-1">
          {/* Location */}
          <div className="flex items-center space-x-3">
            <HiOutlineMapPin className="w-5 h-5 text-gray-500 shrink-0" />
            <div>
              <Paragraph1 className="text-xs text-gray-500">
                Location
              </Paragraph1>
              <Paragraph1 className="text-sm font-semibold text-gray-900">
                {location}
              </Paragraph1>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-center space-x-3">
            <HiOutlineCalendar className="w-5 h-5 text-gray-500 shrink-0" />
            <div>
              <Paragraph1 className="text-xs text-gray-500">
                Member Since
              </Paragraph1>
              <Paragraph1 className="text-sm font-semibold text-gray-900">
                {memberSinceYear}
              </Paragraph1>
            </div>
          </div>

          {/* Verification Status */}
          <div className="flex items-center space-x-3">
            <HiOutlineShieldCheck className="w-5 h-5 text-gray-500 shrink-0" />
            <div>
              <Paragraph1 className="text-xs text-gray-500">
                Verification Status
              </Paragraph1>
              <div className="flex items-center">
                <Paragraph1
                  className={`text-sm font-semibold ${
                    isVerified ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {verificationStatus}
                </Paragraph1>
                {isVerified && (
                  <span className="ml-1 inline-flex items-center p-0.5 rounded-full text-white bg-yellow-500">
                    <TiTick className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Statistics */}
        <div className="flex-1 p-4 border border-gray-100 rounded-lg bg-gray-50">
          <Paragraph1 className="text-base font-semibold text-gray-900 mb-4">
            Statistics
          </Paragraph1>

          <div className="space-y-3">
            {/* Total Listings */}
            <div className="flex justify-between items-center text-sm">
              <Paragraph1 className="text-gray-700">Total Listings</Paragraph1>
              <Paragraph1 className="font-semibold text-gray-900">
                {totalListings}
              </Paragraph1>
            </div>

            {/* Completed Rentals */}
            <div className="flex justify-between items-center text-sm">
              <Paragraph1 className="text-gray-700">
                Completed Rentals
              </Paragraph1>
              <Paragraph1 className="font-semibold text-gray-900">
                {completedRentals}
              </Paragraph1>
            </div>

            {/* Average Rating */}
            <div className="flex justify-between items-center text-sm">
              <Paragraph1 className="text-gray-700">Average Rating</Paragraph1>
              <Paragraph1 className="font-semibold text-gray-900">
                {averageRating.toFixed(1)} / {maxRating.toFixed(1)}
              </Paragraph1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Example Usage matching the provided image content ---

const ExampleCuratorAbout: React.FC = () => {
  return (
    <CuratorAboutDetails
      location="Lagos, Nigeria"
      memberSinceYear={2020}
      verificationStatus="Verified Curator"
      totalListings={28}
      completedRentals={156}
      averageRating={4.8}
      maxRating={5.0}
    />
  );
};

export default ExampleCuratorAbout;
