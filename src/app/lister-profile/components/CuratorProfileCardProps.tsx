import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text"; // Using your custom text component
import { HiOutlineShare, HiOutlineChevronLeft } from "react-icons/hi2";
import { TiTick } from "react-icons/ti"; // Using the Tick icon for the Verified badge
import { FaInstagram, FaGlobe } from "react-icons/fa"; // Using Fa icons for social media
import BackButton from "@/common/ui/BackButton";

interface CuratorProfileCardProps {
  /** The name of the curator */
  name: string;
  /** The curator's title or specialty description */
  description: string;
  /** The numerical rating (e.g., 4.8) */
  rating: number;
  /** The number of customer reviews (e.g., 42) */
  reviewCount: number;
  /** The total number of successful rentals (e.g., 156) */
  rentalCount: number;
  /** Boolean to indicate if the profile is verified */
  isVerified: boolean;
  /** Optional Instagram handle (e.g., "@adaezestyle") */
  instagramHandle?: string;
  /** Optional website URL (e.g., "adaezestyle.com") */
  websiteUrl?: string;
  /** Optional URL for the avatar image */
  avatarUrl?: string;
}

const CuratorProfileCard: React.FC<CuratorProfileCardProps> = ({
  name,
  description,
  rating,
  reviewCount,
  rentalCount,
  isVerified,
  instagramHandle,
  websiteUrl,
  avatarUrl,
}) => {
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
            Curator's Profile
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
          {/* Replace with actual image tag using avatarUrl */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${name} avatar`}
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
              {name}
            </Paragraph1>
            {isVerified && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <TiTick className="w-3 h-3 mr-0.5" />
                Verified
              </span>
            )}
          </div>

          <Paragraph1 className="text-sm text-gray-700 leading-snug mb-3">
            {description}
          </Paragraph1>

          {/* Social Links */}
          <div className="flex items-center space-x-4 mb-4">
            {instagramHandle && (
              <a
                href={`https://instagram.com/${instagramHandle.replace(
                  "@",
                  ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-gray-500 hover:text-black transition duration-150"
              >
                <FaInstagram className="w-4 h-4 mr-1" />
                {instagramHandle}
              </a>
            )}
            {websiteUrl && (
              <a
                href={`http://${websiteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-gray-500 hover:text-black transition duration-150"
              >
                <FaGlobe className="w-4 h-4 mr-1" />
                {websiteUrl}
              </a>
            )}
          </div>

          <hr className=" text-gray-200 pb-4" />
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {" "}
            <div className=" items-center flex gap-1">
              {" "}
              {renderStars(rating)}
              <Paragraph1 className="text-sm font-semibold text-gray-900">
                {rating}
              </Paragraph1>
            </div>
            <Paragraph1 className="text-sm text-gray-500">
              ({reviewCount} reviews)
            </Paragraph1>
            <Paragraph1 className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
              {rentalCount} Rentals
            </Paragraph1>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Example Usage matching the provided image content ---

const ExampleCuratorProfile: React.FC = () => {
  return (
    <CuratorProfileCard
      name="Adoeze Okafor"
      description="Luxury fashion curator specializing in evening wear and designer pieces. Over 5 years of experience in styling and fashion rentals."
      rating={4.8}
      reviewCount={42}
      rentalCount={156}
      isVerified={true}
      instagramHandle="@adaezestyle"
      websiteUrl="adaezestyle.com"
      // You'd replace this with a real image URL
      avatarUrl="https://i.pravatar.cc/150?u=ChiomaNnamdi"
    />
  );
};

export default ExampleCuratorProfile;
