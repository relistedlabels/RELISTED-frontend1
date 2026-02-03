"use client";

import React, { useState, useEffect } from "react";
import { SlidersVertical, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import PriceRangeSlider from "./PriceRangeSlider";
import { useProductsStore } from "@/store/useProductsStore";

// --------------------
// Mock Data
// --------------------
const filterData = {
  gender: ["Woman", "Men", "Kids"],
  categories: [
    "Dresses",
    "Tops",
    "Lingerie & Lounge Wear",
    "Blouse",
    "Vintage",
  ],
  brands: ["H&M", "Mark & Spencer", "Victoria Secret", "Dior", "Gucci"],
  sizes: ["Medium", "Large", "Plus Size", "Sexy Plus Size"],
};

// --------------------
// Animation Variants
// --------------------
const variants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
};
interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose }) => {
  const {
    filters,
    setSearch,
    setGender,
    setCategories,
    setBrands,
    setSizes,
    setPriceRange,
    clearFilters,
    applyFilters,
  } = useProductsStore();

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter((c: string) => c !== category);
    setCategories(newCategories);
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...filters.brands, brand]
      : filters.brands.filter((b: string) => b !== brand);
    setBrands(newBrands);
  };

  const handleApplyFilters = () => {
    applyFilters();
    onClose();
  };

  const handleClearFilters = () => {
    clearFilters();
    applyFilters();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-99 bg-black/70 backdrop--blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed top-0 right-0 h-screen hide-scrollbar overflow-y-auto bg-white shadow-2xl px-4  flex flex-col w-full sm:w-94"
            role="dialog"
            aria-modal="true"
            aria-label="Product Filters"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between sticky top-0 items-center pb-4 border-b border-gray-100 pt-6 z-10  bg-white">
              <Paragraph1 className=" font-bold tracking-widest text-gray-800">
                FILTERS
              </Paragraph1>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-black p-1 rounded-full transition"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="grow pt-4 pb-20 space-y-8">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    value={filters.search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-gray-100 bg-gray-100 outline-none "
                  />
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
              {/* Gender */}
              <section>
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Gender
                </Paragraph1>
                {filterData.gender.map((item) => (
                  <label
                    key={item}
                    className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={item}
                      checked={filters.gender === item}
                      onChange={(e) => setGender(e.target.value)}
                      className="h-4 w-4 text-black border-gray-300 rounded-full focus:ring-black"
                    />
                    <Paragraph1>{item}</Paragraph1>
                  </label>
                ))}
              </section>
              {/* Categories */}
              <section>
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Categories
                </Paragraph1>
                {filterData.categories.map((item) => (
                  <label
                    key={item}
                    className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
                  >
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(item)}
                      onChange={(e) =>
                        handleCategoryChange(item, e.target.checked)
                      }
                      className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                    <Paragraph1>{item}</Paragraph1>
                  </label>
                ))}
              </section>
              {/* Brands */}
              <section>
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Brands
                </Paragraph1>
                {filterData.brands.map((item) => (
                  <label
                    key={item}
                    className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
                  >
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(item)}
                      onChange={(e) =>
                        handleBrandChange(item, e.target.checked)
                      }
                      className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                    <Paragraph1>{item}</Paragraph1>
                  </label>
                ))}
              </section>
              {/* Sizes */}
              <section>
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Size
                </Paragraph1>
                {filterData.sizes.map((item) => (
                  <label
                    key={item}
                    className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
                  >
                    <input
                      type="radio"
                      name="sizes"
                      value={item}
                      checked={filters.sizes === item}
                      onChange={(e) => setSizes(e.target.value)}
                      className="h-4 w-4 text-black border-gray-300 rounded-full focus:ring-black"
                    />
                    <Paragraph1>{item}</Paragraph1>
                  </label>
                ))}
              </section>
              {/* Price Slider */}
              <PriceRangeSlider
                min={50000}
                max={200000}
                value={filters.priceRange}
                onChange={setPriceRange}
              />{" "}
            </div>

            {/* Footer */}
            <div className="mt-auto py-2 bg-white flex justify-between gap-4 sticky bottom-0">
              <button
                onClick={handleClearFilters}
                className="flex-1 px-4 py-3 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Paragraph1>Clear Filters </Paragraph1>
              </button>

              <button
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-3 text-sm font-semibold bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
              >
                <SlidersVertical size={16} />
                <Paragraph1>Apply Filters </Paragraph1>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --------------------
// Main Component
// --------------------
const Filters: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="border px-4 items-center py-2 flex gap-1 font-semibold text-sm border-black  hover:bg-gray-100 transition "
      >
        <Paragraph1>Filters</Paragraph1>
        <SlidersVertical size={18} />
      </button>

      {/* Filter Panel */}
      <FilterPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default Filters;
