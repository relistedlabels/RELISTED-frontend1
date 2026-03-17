"use client";

import React, { useState } from "react";
import { SlidersVertical, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1 } from "@/common/ui/Text";
import PriceRangeSlider from "./PriceRangeSlider";
import { useRouter, useSearchParams } from "next/navigation";
import { useBrands } from "@/lib/queries/brand/useBrands";
import { useCategories } from "@/lib/queries/category/useCategories";

// --------------------
// Static Data
// --------------------
const sizeOptions = [
  "Small (e.g. 2-5, S-SL, 5-10, 30-35)",
  "Medium (e.g. 6-10, M-ML, 11-15, 36-40)",
  "Large (e.g. 11-15, L-XL, 16-20, 41-45)",
  "Plus Size (e.g. 16-20, XL-2XL, 21-25, 46-50)",
  "Sexy Plus Size (e.g. 21-25, 2XL-3XL, 26-30, 51-55)",
];
const colorOptions = [
  "Red",
  "Blue",
  "Black",
  "White",
  "Green",
  "Yellow",
  "Purple",
  "Pink",
  "Gray",
  "Brown",
];
const conditionOptions = [
  "New",
  "Like New",
  "Excellent",
  "Good",
  "Fair",
  "Poor",
];
const materialOptions = [
  "Cotton",
  "Polyester",
  "Silk",
  "Wool",
  "Linen",
  "Blend",
];

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
    data: brands,
    isPending: brandsLoading,
    isError: brandsError,
  } = useBrands();
  const {
    data: categories,
    isPending: categoriesLoading,
    isError: categoriesError,
  } = useCategories();

  // Search state for brands and categories
  const [brandSearch, setBrandSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const [localFilters, setLocalFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.getAll("category"),
    brand: searchParams.getAll("brand"),
    size: searchParams.get("size") || "",
    color: searchParams.get("color") || "",
    condition: searchParams.get("condition") || "",
    material: searchParams.get("material") || "",
    priceRange: [
      searchParams.get("minPrice")
        ? parseInt(searchParams.get("minPrice")!)
        : 50000,
      searchParams.get("maxPrice")
        ? parseInt(searchParams.get("maxPrice")!)
        : 200000,
    ] as [number, number],
  });

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...localFilters.category, category]
      : localFilters.category.filter((c: string) => c !== category);
    setLocalFilters({ ...localFilters, category: newCategories });
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...localFilters.brand, brand]
      : localFilters.brand.filter((b: string) => b !== brand);
    setLocalFilters({ ...localFilters, brand: newBrands });
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (localFilters.search) params.set("search", localFilters.search);
    localFilters.category.forEach((cat) => params.append("category", cat));
    localFilters.brand.forEach((brand) => params.append("brand", brand));
    if (localFilters.size) params.set("size", localFilters.size);
    if (localFilters.color) params.set("color", localFilters.color);
    if (localFilters.condition) params.set("condition", localFilters.condition);
    if (localFilters.material) params.set("material", localFilters.material);
    if (localFilters.priceRange[0] > 50000)
      params.set("minPrice", localFilters.priceRange[0].toString());
    if (localFilters.priceRange[1] < 200000)
      params.set("maxPrice", localFilters.priceRange[1].toString());

    router.push(`?${params.toString()}`);
    onClose();
  };

  const handleClearFilters = () => {
    router.push("/shop");
    onClose();
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
                    value={localFilters.search}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        search: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-4 py-3 border-gray-100 bg-gray-100 outline-none "
                  />
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              {/* Categories */}
              <section>
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Categories
                </Paragraph1>
                {/* Category Search Bar */}
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded mb-1 text-sm"
                  />
                </div>
                {categoriesLoading ? (
                  <Paragraph1>Loading...</Paragraph1>
                ) : categoriesError ? (
                  <Paragraph1 className="text-red-500">
                    Failed to load categories
                  </Paragraph1>
                ) : (
                  categories
                    ?.filter((cat) =>
                      cat.name
                        .toLowerCase()
                        .includes(categorySearch.toLowerCase()),
                    )
                    .slice(0, 10)
                    .map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
                      >
                        <input
                          type="checkbox"
                          checked={localFilters.category.includes(cat.name)}
                          onChange={(e) =>
                            handleCategoryChange(cat.name, e.target.checked)
                          }
                          className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                        />
                        <Paragraph1>{cat.name}</Paragraph1>
                      </label>
                    ))
                )}
              </section>

              {/* Brands */}
              <section>
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Brands
                </Paragraph1>
                {/* Brand Search Bar */}
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search brands..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded mb-1 text-sm"
                  />
                </div>
                {brandsLoading ? (
                  <Paragraph1>Loading...</Paragraph1>
                ) : brandsError ? (
                  <Paragraph1 className="text-red-500">
                    Failed to load brands
                  </Paragraph1>
                ) : (
                  brands
                    ?.filter((brand) =>
                      brand.name
                        .toLowerCase()
                        .includes(brandSearch.toLowerCase()),
                    )
                    .slice(0, 10)
                    .map((brand) => (
                      <label
                        key={brand.id}
                        className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
                      >
                        <input
                          type="checkbox"
                          checked={localFilters.brand.includes(brand.name)}
                          onChange={(e) =>
                            handleBrandChange(brand.name, e.target.checked)
                          }
                          className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                        />
                        <Paragraph1>{brand.name}</Paragraph1>
                      </label>
                    ))
                )}
              </section>

              {/* Size */}
              <section>
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Size
                </Paragraph1>
                {sizeOptions.map((item) => (
                  <label
                    key={item}
                    className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
                  >
                    <input
                      type="radio"
                      name="size"
                      value={item}
                      checked={localFilters.size === item}
                      onChange={(e) =>
                        setLocalFilters({
                          ...localFilters,
                          size: e.target.value,
                        })
                      }
                      className="h-4 w-4 text-black border-gray-300 rounded-full focus:ring-black"
                    />
                    <Paragraph1>{item}</Paragraph1>
                  </label>
                ))}
              </section>

              {/* Color */}
              <section>
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Color
                </Paragraph1>
                {colorOptions.map((item) => (
                  <label
                    key={item}
                    className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
                  >
                    <input
                      type="radio"
                      name="color"
                      value={item}
                      checked={localFilters.color === item}
                      onChange={(e) =>
                        setLocalFilters({
                          ...localFilters,
                          color: e.target.value,
                        })
                      }
                      className="h-4 w-4 text-black border-gray-300 rounded-full focus:ring-black"
                    />
                    <Paragraph1>{item}</Paragraph1>
                  </label>
                ))}
              </section>

              {/* Condition */}
              <section>
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Condition
                </Paragraph1>
                {conditionOptions.map((item) => (
                  <label
                    key={item}
                    className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={item}
                      checked={localFilters.condition === item}
                      onChange={(e) =>
                        setLocalFilters({
                          ...localFilters,
                          condition: e.target.value,
                        })
                      }
                      className="h-4 w-4 text-black border-gray-300 rounded-full focus:ring-black"
                    />
                    <Paragraph1>{item}</Paragraph1>
                  </label>
                ))}
              </section>

              {/* Material */}
              <section>
                <Paragraph1 className="uppercase font-bold text-xs mb-3 text-gray-800">
                  Material
                </Paragraph1>
                {materialOptions.map((item) => (
                  <label
                    key={item}
                    className="flex items-center space-x-2 py-1 cursor-pointer select-none text-sm text-gray-700 hover:text-gray-900"
                  >
                    <input
                      type="radio"
                      name="material"
                      value={item}
                      checked={localFilters.material === item}
                      onChange={(e) =>
                        setLocalFilters({
                          ...localFilters,
                          material: e.target.value,
                        })
                      }
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
                value={localFilters.priceRange}
                onChange={(priceRange) =>
                  setLocalFilters({ ...localFilters, priceRange })
                }
              />
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

      <FilterPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default Filters;
