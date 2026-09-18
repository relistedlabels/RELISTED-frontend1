"use client";

import React, { useState } from "react";
import { useNewsletterSubscribers } from "@/lib/queries/newsletter/useNewsletterSubscribers";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { buttonPrimary, buttonSecondary } from "@/common/ui/buttonClasses";
import { dialogBackdrop, dialogCard } from "@/common/ui/dashboardClasses";
import { Search, X } from "lucide-react";

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsletterModal({
  isOpen,
  onClose,
}: NewsletterModalProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useNewsletterSubscribers(
    page,
    20,
    debouncedSearch,
  );

  if (!isOpen) return null;

  const subscribers = data?.subscribers || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className={dialogBackdrop}>
      <div className={`${dialogCard} max-w-2xl max-h-[80vh] p-0 overflow-hidden flex flex-col shadow-xl`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <Paragraph3 className="text-2xl font-bold">
              Newsletter Subscribers
            </Paragraph3>
            <Paragraph1 className="text-gray-500 mt-1">
              {total} {total === 1 ? "subscriber" : "subscribers"}
            </Paragraph1>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Paragraph1 className="text-gray-500">
                Loading subscribers...
              </Paragraph1>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <Paragraph1 className="text-red-500">
                Failed to load subscribers
              </Paragraph1>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Paragraph1 className="text-gray-500">
                {debouncedSearch
                  ? "No subscribers found matching your search"
                  : "No subscribers yet"}
              </Paragraph1>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {subscribers.map((subscriber) => (
                <div
                  key={subscriber.id}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <Paragraph1 className="font-medium text-gray-900">
                      {subscriber.email}
                    </Paragraph1>
                    <Paragraph1 className="text-xs text-gray-500 mt-1">
                      Subscribed{" "}
                      {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </Paragraph1>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      subscriber.isActive
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {subscriber.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <Paragraph1 className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </Paragraph1>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`${buttonSecondary} disabled:cursor-not-allowed`}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`${buttonPrimary} disabled:cursor-not-allowed`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
