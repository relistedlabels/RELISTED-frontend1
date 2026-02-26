"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Clock, X, ArrowRight } from "lucide-react";
import ProductCard from "@/common/ui/ProductCard";
import { useBrowseStore } from "@/store/useBrowseStore";
import { Paragraph1 } from "@/common/ui/Text";
import { useProducts } from "@/lib/queries/product/useProducts";
import { useRouter } from "next/navigation";

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const recentSearches = useBrowseStore((s) => s.recentSearches);
  const clearSearches = useBrowseStore((s) => s.clearSearches);
  const recentlyViewed = useBrowseStore((s) => s.recentlyViewed);
  const addSearch = useBrowseStore((s) => s.addSearch);
  const addViewed = useBrowseStore((s) => s.addViewed);

  const router = useRouter();

  const {
    data: products,
    isLoading,
    error,
  } = useProducts(query ? { search: query, limit: 5 } : undefined);

  // Persist current query as search term before navigating to product
  const handleProductClick = (product: any) => {
    if (query.trim()) addSearch(query.trim()); // Persist search term
    setOpen(false); // Close modal
    router.push(`/shop/product-details/${product.id}`); // Navigate
  };

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
            className="fixed inset-0 z-900 h-screen w-full bg-black/0 flex items-start justify-center sm:pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="bg-white text-black w-full shadow-2xl max-w-2xl h-screen sm:h-fit sm:rounded-sm p-5"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <Paragraph1 className="font-bold uppercase">Search</Paragraph1>
                <X className="cursor-pointer" onClick={() => setOpen(false)} />
              </div>

              {/* Search Input */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && query.trim())
                      addSearch(query.trim());
                  }}
                  placeholder="Search products, brands..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-400 outline-none"
                />
              </div>

              <div className="flex flex-col h-[500px] sm:h-[400px] hide-scrollbar overflow-hidden overflow-y-auto">
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
                          className="flex justify-between items-center py-1 hover:bg-gray-50 gap-2 text-gray-600 cursor-pointer hover:text-black"
                        >
                          <div className="flex gap-2 items-center">
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
                    <Paragraph1 className="text-gray-600 mb-3">
                      Recently Viewed
                    </Paragraph1>
                    <div className="flex gap-4 hide-scrollbar overflow-x-auto">
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
                  <div className="space-y-3">
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
                    {!isLoading && !error && products?.length === 0 && (
                      <Paragraph1 className="text-gray-500">
                        No results found
                      </Paragraph1>
                    )}
                    {!isLoading &&
                      !error &&
                      products?.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleProductClick(item)}
                          className="p-3 flex justify-between items-start rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                          <div>
                            <Paragraph1 className="font-medium">
                              {item.name}
                            </Paragraph1>
                            <Paragraph1 className="text-sm text-gray-500">
                              {item.brand?.name || "BRAND"}
                            </Paragraph1>
                          </div>
                          <ArrowRight className="rotate-225" />
                        </div>
                      ))}
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
