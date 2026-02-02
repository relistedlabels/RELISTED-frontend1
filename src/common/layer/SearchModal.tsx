"use client";

import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Clock, X, ArrowRight } from "lucide-react";
import ProductCard from "@/common/ui/ProductCard";
import { products } from "@/data/productsData";
import { Header1Plus, Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";

const recentSearches = ["Sneakers", "Wrist Watch", "Backpack"];

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // 🔍 Suggestions when typing
  const suggestions = useMemo(() => {
    if (!query) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <>
      {/* 🔎 Search Icon Trigger */}
      <div
        onClick={() => setOpen(true)}
        className="flex items-center space-x-2 cursor-pointer"
      >
        <Search className="w-5 h-5" />
      </div>

      {/* 🧠 Modal */}
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
                <Paragraph1 className=" font-bold uppercase">Search</Paragraph1>
                <X className="cursor-pointer" onClick={() => setOpen(false)} />
              </div>

              {/* Input */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, brands..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-400 outline-none"
                />
              </div>
              <div className=" flex flex-col h-[500px] sm:h-[400px] hide-scrollbar overflow-hidden overflow-y-auto">
                {/* DEFAULT VIEW (no typing) */}
                {!query && (
                  <>
                    {/* Recent Searches */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <Paragraph1 className=" text-gray-600">
                          Recent
                        </Paragraph1>

                        <Paragraph1 className=" text-gray-500">
                          Clear
                        </Paragraph1>
                      </div>

                      <div className="space-y-2">
                        {recentSearches.map((item, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center py-1 hover:bg-gray-50 gap-2 text-gray-600 cursor-pointer hover:text-black"
                          >
                            <div className=" flex gap-2 items-center">
                              {" "}
                              <Clock className="w-4 h-4" />
                              <Paragraph1 className=" font- text-black">
                                <span>{item}</span>{" "}
                              </Paragraph1>
                            </div>

                            <ArrowRight className=" rotate-225" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recently Viewed */}
                    <div>
                      <Paragraph1 className="text-gray-600 mb-3">
                        Recently Viewed
                      </Paragraph1>

                      <div className="flex gap-4 hide-scrollbar overflow-x-auto">
                        {products.slice(0, 4).map((item, index) => (
                          <div
                            key={index}
                            className="min-w-[200px] max-w-[200px] shrink-0"
                          >
                            <ProductCard
                              image={item.image}
                              brand={item.brand}
                              name={item.name}
                              price={item.price}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* 🔎 SUGGESTIONS */}
                {query && (
                  <div className="space-y-3   ">
                    {suggestions.length ? (
                      suggestions.map((item, index) => (
                        <div
                          key={index}
                          className="p-3 flex justify-between items-start rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                          <div>
                            <Paragraph1 className="font-medium">
                              {item.name}
                            </Paragraph1>
                            <Paragraph1 className="text-sm text-gray-500">
                              {item.brand}
                            </Paragraph1>{" "}
                          </div>
                          <ArrowRight className=" rotate-225" />
                        </div>
                      ))
                    ) : (
                      <Paragraph1 className="text-gray-500">
                        No results found
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
