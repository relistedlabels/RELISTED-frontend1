"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import {
  type AdminSearchResult,
  useAdminSearch,
} from "@/lib/queries/admin/useAdminSearch";

const resolveHref = (href: string, adminId: string | undefined): string =>
  href.replace("[id]", adminId ?? "");

const getEntityIcon = (type: AdminSearchResult["type"]) => {
  switch (type) {
    case "order":
      return "📦";
    case "user":
      return "👤";
    case "listing":
      return "👗";
    case "dispute":
      return "⚠️";
    case "review":
      return "⭐";
    case "request":
      return "📋";
    default:
      return "📄";
  }
};

const getEntityLabel = (type: AdminSearchResult["type"]) => {
  const labels: Record<AdminSearchResult["type"], string> = {
    order: "Order",
    user: "User",
    listing: "Listing",
    dispute: "Dispute",
    review: "Review",
    request: "Request",
  };
  return labels[type];
};

export default function AdminSearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { data: searchResults } = useAdminSearch(searchQuery, { limit: 10 });
  const inputRef = useRef<HTMLInputElement>(null);
  const params = useParams();
  const adminId = Array.isArray(params.id) ? params.id[0] : params.id;

  const handleClear = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const handleSelectResult = () => {
    setSearchQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search orders, users, listings..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-9 pr-8 py-2 rounded-lg bg-gray-50 border border-gray-300 text-sm text-gray-900 placeholder-gray-500 transition-colors focus:outline-none focus:bg-white focus:border-gray-400"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg bg-white shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {searchResults?.results && searchResults.results.length > 0 ? (
            <div className="py-1">
              {searchResults.results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={resolveHref(result.href, adminId)}
                  onClick={handleSelectResult}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg shrink-0">
                    {getEntityIcon(result.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {result.title}
                    </p>
                    {result.subtitle && (
                      <p className="truncate text-xs text-gray-500">
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-400 shrink-0 whitespace-nowrap">
                    {getEntityLabel(result.type)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500">
                No results found for "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close search results"
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
