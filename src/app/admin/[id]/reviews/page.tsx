"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import {
  useAdminReviewModeration,
  useAdminReviews,
} from "@/lib/queries/admin/useAdminReviews";
import { AdminTabBar, AdminTabButton } from "../../components/AdminSectionTabs";
import { toast } from "sonner";

type VisibilityTab = "all" | "visible" | "hidden";

export default function AdminReviewsPage() {
  const [visibility, setVisibility] = useState<VisibilityTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, error } = useAdminReviews({
    page: 1,
    limit: 50,
    search: searchQuery,
    visibility,
  });
  const { hide, remove } = useAdminReviewModeration();

  const reviews = data?.reviews ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Paragraph1 className="font-bold text-2xl text-gray-900">Reviews</Paragraph1>
        <Paragraph2 className="text-gray-600">
          Moderate renter feedback on listers and products.
        </Paragraph2>
      </div>

      <AdminTabBar>
        {(["all", "visible", "hidden"] as VisibilityTab[]).map((tab) => (
          <AdminTabButton
            key={tab}
            active={visibility === tab}
            onClick={() => setVisibility(tab)}
          >
            {tab === "all" ? "All" : tab === "visible" ? "Visible" : "Hidden"}
          </AdminTabButton>
        ))}
      </AdminTabBar>

      <div className="relative max-w-md">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search reviews, products, or users"
          className="w-full rounded-lg border border-gray-200 py-2 pr-3 pl-9 text-sm"
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} columns={5} />
      ) : error ? (
        <Paragraph1 className="text-red-600">Could not load reviews.</Paragraph1>
      ) : reviews.length === 0 ? (
        <Paragraph1 className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          No reviews found.
        </Paragraph1>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Renter</th>
                <th className="px-4 py-3">Lister</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b border-gray-100 align-top">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {review.product.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{review.renter.name}</td>
                  <td className="px-4 py-3 text-gray-700">{review.lister.name}</td>
                  <td className="px-4 py-3 text-gray-900">{review.rating}/5</td>
                  <td className="max-w-xs px-4 py-3 text-gray-700">
                    {review.comment?.trim() || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        review.hiddenAt
                          ? "bg-gray-100 text-gray-600"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {review.hiddenAt ? "Hidden" : "Visible"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={hide.isPending || remove.isPending}
                        onClick={async () => {
                          try {
                            await hide.mutateAsync({
                              reviewId: review.id,
                              hidden: !review.hiddenAt,
                            });
                            toast.success(
                              review.hiddenAt ? "Review restored." : "Review hidden.",
                            );
                          } catch (err) {
                            toast.error(
                              err instanceof Error
                                ? err.message
                                : "Could not update review.",
                            );
                          }
                        }}
                        className="rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                      >
                        {review.hiddenAt ? "Restore" : "Hide"}
                      </button>
                      <button
                        type="button"
                        disabled={hide.isPending || remove.isPending}
                        onClick={async () => {
                          if (!window.confirm("Delete this review permanently?")) {
                            return;
                          }
                          try {
                            await remove.mutateAsync(review.id);
                            toast.success("Review deleted.");
                          } catch (err) {
                            toast.error(
                              err instanceof Error
                                ? err.message
                                : "Could not delete review.",
                            );
                          }
                        }}
                        className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
