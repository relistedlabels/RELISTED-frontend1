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
  // All hooks must be called before any return
  const [showShare, setShowShare] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const { data: user, isLoading, error } = usePublicUserById(userId);

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

  // Get profile URL from window location
  const profileUrl =
    typeof window !== "undefined"
      ? window.location.origin + `/lister-profile/${userId}`
      : `/lister-profile/${userId}`;

  // Share message
  const shareMsg = encodeURIComponent(
    `Check out this luxury fashion curator on RELISTED! ✨\n${profileUrl}`,
  );

  // Share options
  const shareOptions = [
    {
      label: "Copy Link",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 14L21 3m0 0v7m0-7h-7"
          />
        </svg>
      ),
      onClick: () => {
        navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
    },
    {
      label: "WhatsApp",
      icon: (
        <img src="/icons/whatsapp.jpg" alt="WhatsApp" className="w-5 h-5" />
      ),
      href: `https://wa.me/?text=${shareMsg}`,
    },
    {
      label: "Telegram",
      icon: (
        <img src="/icons/telegram.jpg" alt="Telegram" className="w-5 h-5" />
      ),
      href: `https://t.me/share/url?url=${profileUrl}&text=${shareMsg}`,
    },
    {
      label: "Facebook",
      icon: (
        <img src="/icons/facebook.png" alt="Facebook" className="w-5 h-5" />
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${profileUrl}`,
    },
    {
      label: "Instagram",
      icon: (
        <img src="/icons/instagram.jpg" alt="Instagram" className="w-5 h-5" />
      ),
      href: `https://www.instagram.com/?url=${profileUrl}`,
    },
    {
      label: "Email",
      icon: (
        <img src="/icons/gmail.png" alt="gmail" className="w-5 h-5" />
      ),
      href: `mailto:?subject=Check%20out%20this%20curator%20on%20RELISTED!&body=${shareMsg}`,
    },
  ];

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
        <button
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-150"
          onClick={() => setShowShare(true)}
          aria-label="Share profile"
        >
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
            <div className=" items-center flex gap-1">
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

      {/* Share Profile Popup */}
      {showShare && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowShare(false)}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-xs mx-auto flex flex-col items-center animate-fadeIn"
            style={{ animation: "fadeIn 0.3s cubic-bezier(.4,0,.2,1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowShare(false)}
              aria-label="Close share popup"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <Paragraph1 className="text-lg font-bold text-gray-900 mb-2">
              Share Profile
            </Paragraph1>
            <Paragraph3 className="text-sm text-gray-500 mb-4 text-center">
              Share this listers's profile with your friends!
            </Paragraph3>
            <div className="flex flex-col gap-3 w-full">
              {shareOptions.map((opt, idx) =>
                opt.href ? (
                  <a
                    key={opt.label}
                    href={opt.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition duration-150 text-gray-800 font-medium"
                  >
                    {opt.icon}
                    <Paragraph1> {opt.label}</Paragraph1>
                  </a>
                ) : (
                  <button
                    key={opt.label}
                    onClick={opt.onClick}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition duration-150 text-gray-800 font-medium"
                  >
                    {opt.icon}
                    <Paragraph1> {opt.label}</Paragraph1>
                    {opt.label === "Copy Link" && copied && (
                      <Paragraph1 className="ml-2 text-green-500 text-xs">
                        Copied!
                      </Paragraph1>
                    )}
                  </button>
                ),
              )}
            </div>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuratorProfileCard;
