"use client";

import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { useProductReviews } from "@/lib/queries/review/useProductReviews";

interface Review {
  name: string;
  rating: number;
  comment: string;
}

const ReviewItem: React.FC<Review> = ({ name, rating, comment }) => {
  const renderStars = (rate: number) => (
    <span className="text-yellow-500" aria-label={`${rate} star rating`}>
      {"★".repeat(Math.floor(rate))}
      {"☆".repeat(5 - Math.floor(rate))}
    </span>
  );

  return (
    <div className="border-b border-gray-100 py-4 last:border-b-0">
      <div className="mb-1 flex items-center space-x-2">
        <Paragraph1 className="font-semibold text-gray-900">{name}</Paragraph1>
        {renderStars(rating)}
      </div>
      {comment ? (
        <Paragraph1 className="leading-snug text-gray-700">
          &ldquo;{comment}&rdquo;
        </Paragraph1>
      ) : null}
    </div>
  );
};

const ProductReviews: React.FC<{ reviews: Review[] }> = ({ reviews }) => {
  if (!reviews.length) {
    return (
      <Paragraph1 className="p-4 text-gray-600">
        No reviews yet. Be the first to review this product!
      </Paragraph1>
    );
  }

  return (
    <div className="-mt-2 p-4 font-sans sm:p-0">
      <div className="divide-y divide-gray-100">
        {reviews.map((review) => (
          <ReviewItem key={`${review.name}-${review.comment}`} {...review} />
        ))}
      </div>
    </div>
  );
};

const ProductReviewsBlock: React.FC<{ productId: string }> = ({ productId }) => {
  const { data, isLoading, error } = useProductReviews(productId, {
    limit: 10,
    sort: "newest",
  });

  if (isLoading) {
    return (
      <Paragraph1 className="p-4 text-gray-600">Loading reviews…</Paragraph1>
    );
  }

  if (error) {
    return (
      <Paragraph1 className="p-4 text-gray-600">
        Reviews are not available right now.
      </Paragraph1>
    );
  }

  const mappedReviews = (data?.reviews ?? []).map((r) => ({
    name: r.name || "Anonymous",
    rating: r.rating,
    comment: r.text || "",
  }));

  return <ProductReviews reviews={mappedReviews} />;
};

export default ProductReviewsBlock;
