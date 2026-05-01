// ENDPOINTS: GET /api/public/users/:userId

"use client";

import React from "react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text"; // Using your custom text component
import { HiOutlineShare, HiOutlineChevronLeft } from "react-icons/hi2";
import { TiTick } from "react-icons/ti"; // Using the Tick icon for the Verified badge
import { FaInstagram, FaGlobe } from "react-icons/fa"; // Using Fa icons for social media
import BackButton from "@/common/ui/BackButton";
import { usePublicUserById } from "@/lib/queries/user/usePublicUserById";
import { ProfileCardSkeleton } from "@/common/ui/SkeletonLoaders";
import { div } from "framer-motion/client";
import { isInhouseManager } from "@/lib/inhouseManager";

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
      icon: <img src="/icons/gmail.png" alt="gmail" className="w-5 h-5" />,
      href: `mailto:?subject=Check%20out%20this%20curator%20on%20RELISTED!&body=${shareMsg}`,
    },
  ];

  if (isLoading) {
    return <ProfileCardSkeleton />;
  }

  if (error || !user) {
    return (
      <div className="font-sans bg-white p-4 sm:p-6 rounded-xl border mt-8 border-gray-200">
        <Paragraph1 className="text-gray-700">
          Profile not found
        </Paragraph1>{" "}
      </div>
    );
  }

  return (
    <div>
      <div className=" flex container px-4 sm:px-0 mx-auto mt-6 mb-4 items-center gap-2">
        <BackButton />
        <Paragraph2> Lister’s Profile</Paragraph2>
      </div>
      <div className=" bg-black text-white ">
        <div></div>
        <div className="font-sans container px-4 sm:px-0 mx-auto p-6 sm:p-8 rounded-xl ">
          {/* Profile Details */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}

            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-700 shrink-0 border-4 border-white">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.name} avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl text-gray-500 flex items-center justify-center h-full">
                  👤
                </span>
              )}
            </div>

            {/* Text Content */}
            <div className="grow w-full">
              <div className=" flex w-full justify-between">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Paragraph1 className="text-2xl sm:text-3xl font-bold text-white">
                    {user.name}
                  </Paragraph1>
                  {isInhouseManager(userId) && (
                    <Paragraph1 className="text-sm text-gray-400 ">
                      - Managed by Relisted
                    </Paragraph1>
                  )}
                  {user.isVerified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800">
                      <TiTick className="w-4 h-4 mr-1" />
                      Verified
                    </span>
                  )}
                </div>

                <button
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 transition duration-150"
                  onClick={() => setShowShare(true)}
                  aria-label="Share profile"
                >
                  <HiOutlineShare className="w-5 h-5 text-black" />
                </button>
              </div>

              <Paragraph1 className="text-sm text-gray-300 leading-relaxed mb-4">
                {user.bio || user.shopDescription || "Luxury fashion curator"}
              </Paragraph1>

              <hr className="border-gray-700 my-4" />

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  {renderStars(user.rating)}
                  <Paragraph1 className="text-sm font-semibold text-white ml-1">
                    {user.rating.toFixed(1)}
                  </Paragraph1>
                </div>
                <Paragraph1 className="text-sm text-gray-400">
                  ({user.reviewCount} reviews)
                </Paragraph1>
                <Paragraph1 className="text-sm font-medium text-white bg-gray-800 px-3 py-1 rounded-full">
                  {user.itemCount} Rentals
                </Paragraph1>
              </div>
            </div>
          </div>

          {/* Share Profile Popup */}
          {showShare && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
              onClick={() => setShowShare(false)}
            >
              <div
                className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-xs mx-4 flex flex-col items-center animate-fadeIn"
                style={{ animation: "fadeIn 0.3s cubic-bezier(.4,0,.2,1)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
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
                  Share this lister's profile with your friends!
                </Paragraph3>
                <div className="flex flex-col gap-3 w-full">
                  {shareOptions.map((opt) =>
                    opt.href ? (
                      <a
                        key={opt.label}
                        href={opt.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition duration-150 text-gray-800 font-medium"
                      >
                        {opt.icon}
                        <Paragraph1 className="text-sm">
                          {" "}
                          {opt.label}
                        </Paragraph1>
                      </a>
                    ) : (
                      <button
                        key={opt.label}
                        onClick={opt.onClick}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition duration-150 text-gray-800 font-medium"
                      >
                        {opt.icon}
                        <Paragraph1 className="text-sm">
                          {" "}
                          {opt.label}
                        </Paragraph1>
                        {opt.label === "Copy Link" && copied && (
                          <Paragraph1 className="ml-auto text-green-500 text-xs">
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
      </div>
    </div>
  );
};

export default CuratorProfileCard;
