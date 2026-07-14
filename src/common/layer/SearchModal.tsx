"use client";

import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Clock, X, ArrowRight } from "lucide-react";
import ProductCard from "@/common/ui/ProductCard";
import { useBrowseStore } from "@/store/useBrowseStore";
import { Paragraph1 } from "@/common/ui/Text";
import { usePublicSearch } from "@/lib/queries/search/usePublicSearch";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cloudinaryOptimizedImageUrl } from "@/lib/media/cloudinaryOptimizedImageUrl";

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const HIDDEN_ID = "7d172d18-daad-46cd-ab6d-8d8af28c0b16";

  const recentSearches = useBrowseStore((s) => s.recentSearches);
  const clearSearches = useBrowseStore((s) => s.clearSearches);
  const recentlyViewed = useBrowseStore((s) => s.recentlyViewed);
  const addSearch = useBrowseStore((s) => s.addSearch);
  const addViewed = useBrowseStore((s) => s.addViewed);

  const router = useRouter();

  const {
    data: results,
    isLoading,
    error,
  } = usePublicSearch(query, { type: "all", limit: 50 });

  // Separate and limit results, filtering out hidden items on production
  const { products, listers } = useMemo(() => {
    if (!results) return { products: [], listers: [] };

    const products = results
      .filter((item: any) => item.type === "product")
      .filter((item: any) => item.curatorId !== HIDDEN_ID)
      .slice(0, 7);

    const listers = results
      .filter((item: any) => item.type === "lister")
      .filter((item: any) => item.id !== HIDDEN_ID)
      .slice(0, 3);

    return { products, listers };
  }, [results]);

  // Persist current query as search term before navigating to recent searches
  const handleRecentSearchClick = (term: string) => {
    setQuery(term); // Reset input to clicked term
    // Query automatically runs
  };

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <Search className="w-5 h-5" />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="z-900 fixed inset-0 flex justify-center items-start bg-black/0 sm:pt-20 w-full h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="bg-white shadow-2xl p-5 sm:rounded-sm w-full max-w-2xl h-screen sm:h-fit text-black"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <Paragraph1 className="font-bold uppercase">Search</Paragraph1>
                <X className="cursor-pointer" onClick={() => setOpen(false)} />
              </div>

              {/* Search Input */}
              <div className="relative mb-6">
                <Search className="top-1/2 left-3 absolute w-4 h-4 text-black -translate-y-1/2" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && query.trim())
                      addSearch(query.trim());
                  }}
                  placeholder="Search products and brands..."
                  className="py-3 pr-4 pl-10 border border-gray-400 rounded-xl outline-none w-full"
                />
              </div>

              <div className="flex flex-col h-[500px] sm:h-[400px] overflow-hidden overflow-y-auto hide-scrollbar">
                {/* Recent Searches */}
                {!query && recentSearches.length > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <Paragraph1 className="text-gray-600">Recent</Paragraph1>
                      <button
                        className="text-gray-500 cursor-pointer"
                        onClick={clearSearches}
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-2">
                      {recentSearches.map((item, i) => (
                        <div
                          key={i}
                          onClick={() => handleRecentSearchClick(item)}
                          className="flex justify-between items-center gap-2 hover:bg-gray-50 py-1 text-gray-600 hover:text-black cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <Paragraph1 className="text-black">
                              {item}
                            </Paragraph1>
                          </div>
                          <ArrowRight className="rotate-225" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recently Viewed */}
                {!query && recentlyViewed.length > 0 && (
                  <div>
                    <Paragraph1 className="mb-3 text-gray-600">
                      Recently Viewed
                    </Paragraph1>
                    <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                      {recentlyViewed.map((item) => (
                        <div
                          key={item.id}
                          className="min-w-[200px] max-w-[200px] shrink-0"
                        >
                          <ProductCard {...item} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Query Results */}
                {query && (
                  <div className="space-y-6">
                    {isLoading && (
                      <Paragraph1 className="text-gray-500">
                        Searching...
                      </Paragraph1>
                    )}
                    {error && (
                      <Paragraph1 className="text-red-500">
                        Failed to fetch results
                      </Paragraph1>
                    )}

                    {/* Products Section */}
                    {!isLoading && !error && products.length > 0 && (
                      <div>
                        <Paragraph1 className="mb-3 font-semibold text-gray-600">
                          Similar Products ({products.length})
                        </Paragraph1>
                        <div className="space-y-2">
                          {products.map((item: any) => (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (query.trim()) addSearch(query.trim());
                                setOpen(false);
                                router.push(`/shop/product-details/${item.id}`);
                              }}
                              className="flex items-center gap-3 hover:bg-gray-100 p-3 rounded-lg transition cursor-pointer"
                            >
                              <div className="bg-gray-200 rounded-md w-12 h-12 overflow-hidden shrink-0">
                                <Image
                                  src={
                                    cloudinaryOptimizedImageUrl(item.image, {
                                      preset: "thumb",
                                    }) || "/placeholder.jpg"
                                  }
                                  alt={item.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <Paragraph1 className="font-medium truncate">
                                  {item.name}
                                </Paragraph1>
                                <Paragraph1 className="text-gray-500 text-sm">
                                  By{" "}
                                  {item.lister?.split(" ").pop() || "New user"}{" "}
                                  • ₦{item.price?.toLocaleString()}
                                </Paragraph1>
                              </div>
                              <ArrowRight className="rotate-225 shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Listers Section */}
                    {!isLoading && !error && listers.length > 0 && (
                      <div>
                        <Paragraph1 className="mb-3 font-semibold text-gray-600">
                          Similar Listers ({listers.length})
                        </Paragraph1>
                        <div className="space-y-3">
                          {listers.map((lister: any) => (
                            <Link
                              key={lister.id}
                              href={`/lister-profile/${lister.id}`}
                              onClick={() => {
                                if (query.trim()) addSearch(query.trim());
                                setOpen(false);
                              }}
                              className="flex items-center gap-3 hover:bg-gray-100 p-3 rounded-lg transition cursor-pointer"
                            >
                              <div className="bg-gray-200 rounded-full w-12 h-12 overflow-hidden shrink-0">
                                <Image
                                  src={
                                    cloudinaryOptimizedImageUrl(lister.avatar, {
                                      preset: "thumb",
                                    }) || "/images/default-avatar.jpg"
                                  }
                                  alt={lister.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <Paragraph1 className="font-medium truncate">
                                  {lister.name}
                                </Paragraph1>
                                <Paragraph1 className="text-gray-500 text-sm">
                                  Lister on RELISTED
                                </Paragraph1>
                              </div>
                              <ArrowRight className="rotate-225 shrink-0" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isLoading &&
                      !error &&
                      products.length === 0 &&
                      listers.length === 0 && (
                        <Paragraph1 className="text-gray-500">
                          No results found for "{query}"
                        </Paragraph1>
                      )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
