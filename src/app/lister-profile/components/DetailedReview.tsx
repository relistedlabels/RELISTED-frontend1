// ENDPOINTS: GET /api/public/users/:userId/reviews

"use client";

import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { CardGridSkeleton } from "@/common/ui/SkeletonLoaders";
import { usePublicUserReviews } from "@/lib/queries/user/usePublicUserReviews";

interface DetailedReview {
  id: string;
  name: string;
  date: string;
  rating: number;
  comment: string;
  isMostHelpful?: boolean;
  avatarUrl?: string;
}

interface DetailedReviewProps {
  userId: string;
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

  const avatarSrc =
    avatarUrl ?? `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`;

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl mb-4">
      {isMostHelpful && (
        <span className="inline-flex mb-4 items-center px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-400/50 text-gray-900">
          Most Helpful
        </span>
      )}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start space-x-3">
          <div className="sm:w-16 w-12 h-12 sm:h-16 rounded-full overflow-hidden bg-gray-200 shrink-0">
            <img
              src={avatarSrc}
              alt={`${name} avatar`}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Paragraph1 className="text-sm font-semibold text-gray-900">
                {name}
              </Paragraph1>
            </div>
            {renderStars(rating)}
            <Paragraph1 className="text-sm text-gray-700 leading-snug mt-2">
              {comment}
            </Paragraph1>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <Paragraph1 className="text-xs text-gray-500">{date}</Paragraph1>
        </div>
      </div>
    </div>
  );
};

const DetailedReviewComponent: React.FC<DetailedReviewProps> = ({ userId }) => {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "rating_high" | "rating_low"
  >("newest");

  const { data, isLoading, error } = usePublicUserReviews(userId, {
    page,
    limit: 10,
    sort: sortBy,
  });

  if (isLoading) {
    return <CardGridSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-xl">
        <Paragraph1 className="text-sm text-red-600">
          Failed to load reviews. Please try again later.
        </Paragraph1>
      </div>
    );
  }

  const reviews = data?.reviews || [];
  const pagination = data?.pagination;

  if (reviews.length === 0) {
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
      {reviews.map((review: DetailedReview) => (
        <FullReviewItem
          key={review.id}
          id={review.id}
          name={review.name}
          date={review.date}
          rating={review.rating}
          comment={review.comment}
          isMostHelpful={review.isMostHelpful}
          avatarUrl={review.avatarUrl}
        />
      ))}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
            disabled={page === pagination.totalPages}
            className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DetailedReviewComponent;
