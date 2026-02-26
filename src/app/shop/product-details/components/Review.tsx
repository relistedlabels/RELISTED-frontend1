import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { usePublicReviews } from "@/lib/queries/review/usePublicReviews";

interface Review {
  /** The name of the reviewer (e.g., "Emma K.") */
  name: string;
  /** The rating out of 5 stars */
  rating: number;
  /** The customer's testimonial text */
  comment: string;
}

interface ProductReviewsProps {
  /** Array of review objects to display */
  reviews: Review[];
}

// Sub-component to render a single review item
const ReviewItem: React.FC<Review> = ({ name, rating, comment }) => {
  // Function to render the star icons
  const renderStars = (rate: number) => {
    return (
      <span className="text-yellow-500" aria-label={`${rate} star rating`}>
        {"★".repeat(Math.floor(rate))}
        {"☆".repeat(5 - Math.floor(rate))}
      </span>
    );
  };

  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      {/* Name and Rating */}
      <div className="flex items-center space-x-2 mb-1">
        <Paragraph1 className=" font-semibold text-gray-900">{name}</Paragraph1>
        {renderStars(rating)}
      </div>

      {/* Comment */}
      <Paragraph1 className=" text-gray-700 leading-snug ">
        "{comment}"
      </Paragraph1>
    </div>
  );
};

const ProductReviews: React.FC<ProductReviewsProps> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <Paragraph1 className=" text-gray-600 p-4">
        No reviews yet. Be the first to review this product!
      </Paragraph1>
    );
  }

  return (
    <div className="font-sans p-4 -mt-2 sm:p-0">
      <div className="divide-y divide-gray-100">
        {reviews.map((review, index) => (
          <ReviewItem key={index} {...review} />
        ))}
      </div>
    </div>
  );
};

// --- Example Usage matching the provided image content ---



const ExampleReviewsBlock: React.FC<any> = ({ productId }) => {
  // Fetch reviews from backend
  const { data: reviews, isLoading, error } = usePublicReviews({ minRating: 1, limit: 10, sort: "newest", type: "product" });

  if (isLoading) {
    return <Paragraph1 className="text-gray-600 p-4">Loading reviews...</Paragraph1>;
  }
  if (error) {
    return <Paragraph1 className="text-red-600 p-4">Failed to load reviews.</Paragraph1>;
  }
  // Map backend reviews to local Review type
  const mappedReviews = Array.isArray(reviews)
    ? reviews.map((r: any) => ({
        name: r.renterName || r.name || "Anonymous",
        rating: r.rating,
        comment: r.text || r.comment || "",
      }))
    : [];
  return <ProductReviews reviews={mappedReviews} />;
};

export default ExampleReviewsBlock;
