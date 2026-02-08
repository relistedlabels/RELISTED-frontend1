// ENDPOINTS: GET /api/public/users/:userId/reviews

import React from "react";
import { Paragraph1 } from "@/common/ui/Text"; // Using your custom text component
import { TiTick } from "react-icons/ti"; // Using the Tick icon if needed for verification/badges

interface DetailedReview {
  name: string;
  date: string;
  rating: number;
  comment: string;
  isMostHelpful?: boolean;
  avatarUrl?: string;
}

interface CuratorFullReviewsProps {
  reviews: DetailedReview[];
}

const FullReviewItem: React.FC<DetailedReview> = ({
  name,
  date,
  rating,
  comment,
  isMostHelpful,
  avatarUrl,
}) => {
  const renderStars = (rate: number) => (
    <span
      className="text-yellow-500 text-base"
      aria-label={`${rate} star rating`}
    >
      {"★".repeat(Math.floor(rate))}
      {"☆".repeat(5 - Math.floor(rate))}
    </span>
  );

  // Generate random avatar if not provided
  const avatarSrc =
    avatarUrl ?? `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`;

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl mb-4 ">
      {isMostHelpful && (
        <span className="inline-flex mb-4 items-center px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-400/50 text-gray-900 ">
          Most Helpful
        </span>
      )}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div className="sm:w-16 w-12 h-12 sm:h-16 rounded-full overflow-hidden bg-gray-200 shrink-0">
            <img
              src={avatarSrc}
              alt={`${name} avatar`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name and Rating */}
          <div>
            <div className="flex items-center space-x-2">
              <Paragraph1 className="text-sm font-semibold text-gray-900">
                {name}
              </Paragraph1>
            </div>
            {renderStars(rating)}

            {/* Comment */}
            <Paragraph1 className="text-sm text-gray-700 leading-snug mt-2">
              {comment}
            </Paragraph1>
          </div>
        </div>

        {/* Date and Badge */}
        <div className="flex flex-col items-end">
          <Paragraph1 className="text-xs text-gray-500">{date}</Paragraph1>
        </div>
      </div>
    </div>
  );
};

const CuratorFullReviews: React.FC<CuratorFullReviewsProps> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-xl">
        <Paragraph1 className="text-sm text-gray-600">
          This curator has no reviews yet.
        </Paragraph1>
      </div>
    );
  }

  return (
    <div className="font-sans">
      {reviews.map((review) => (
        <FullReviewItem key={`${review.name}-${review.date}`} {...review} />
      ))}
    </div>
  );
};

// --- Example Usage ---
const ExampleCuratorFullReviews: React.FC = () => {
  const sampleReviews: DetailedReview[] = [
    {
      name: "Chioma Nnamdi",
      date: "October 10, 2025",
      rating: 5,
      comment:
        "Absolutely loved the evening gown! It fit perfectly and the quality was exceptional. Adaeze was very professional and made the entire rental process seamless. Will definitely rent again!",
      isMostHelpful: true,
      avatarUrl: "https://i.pravatar.cc/150?u=ChiomaNnamdi",
    },
    {
      name: "Blessing Okonkwo",
      date: "September 28, 2025",
      rating: 5,
      comment:
        "Beautiful pieces and excellent service. The dress was exactly as described and in pristine condition. Highly recommend!",
      isMostHelpful: true,
      avatarUrl: "https://i.pravatar.cc/150?u=BlessingOkonkwo",
    },
    {
      name: "Funke Adebayo",
      date: "September 15, 2025",
      rating: 4,
      comment:
        "Great experience overall. The dress was stunning and got so many compliments. Only minor issue was pickup timing, but Adaeze was accommodating.",
      avatarUrl: "https://i.pravatar.cc/150?u=FunkeAdebayo",
    },
    {
      name: "Ngozi Eze",
      date: "August 30, 2025",
      rating: 5,
      comment:
        "Perfect for my event! The quality is amazing and Adaeze provides excellent styling advice. Truly a professional curator.",
      avatarUrl: "https://i.pravatar.cc/150?u=NgoziEze",
    },
  ];

  return <CuratorFullReviews reviews={sampleReviews} />;
};

export default ExampleCuratorFullReviews;
