"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import { usePublicProductById } from "@/lib/queries/product/usePublicProductById";
import { CardGridSkeleton } from "@/common/ui/SkeletonLoaders";

interface ProductMediaGalleryProps {
  productId: string;
}

const ProductMediaGallery: React.FC<ProductMediaGalleryProps> = ({
  productId,
}) => {
  const { data: product, isLoading } = usePublicProductById(productId);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Use product images or fallback to empty array
  const media = product?.images
    ? product.images.map((src) => ({ type: "image" as const, src }))
    : [];

  if (isLoading) {
    return <CardGridSkeleton count={1} />;
  }

  if (media.length === 0) {
    return (
      <div className="w-full h-[250px] sm:h-[420px] bg-black/5 rounded-xl overflow-hidden flex items-center justify-center">
        <p>No images available for this product.</p>
      </div>
    );
  }

  const nextMedia = () => {
    setActiveIndex((prev) => (prev + 1) % media.length);
  };

  const prevMedia = () => {
    setActiveIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const activeItem = media[activeIndex];

  return (
    <div className="w-full flex flex-col">
      {/* Main Preview */}
      <motion.div
        layout
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full h-[250px] sm:h-[420px] bg-black/5 rounded-xl overflow-hidden cursor-zoom-in"
        onClick={() => setIsOpen(true)}
      >
        <AnimatePresence mode="wait">
          {activeItem.type === "image" ? (
            <motion.img
              key={activeItem.src}
              src={activeItem.src}
              alt="Product"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover"
            />
          ) : (
            <motion.div
              key={activeItem.src}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full bg-black flex items-center justify-center relative"
            >
              <video
                src={activeItem.src}
                className="w-full h-full object-cover"
                controls
              />
              <Play className="absolute w-16 h-16 text-white opacity-50" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={prevMedia}
          className="p-2 hover:bg-gray-200 rounded-full transition"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="text-center text-sm text-gray-600">
          {activeIndex + 1} of {media.length}
        </div>

        <button
          onClick={nextMedia}
          className="p-2 hover:bg-gray-200 rounded-full transition"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
        {media.map((item, idx) => (
          <motion.button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            whileHover={{ scale: 1.05 }}
            className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition ${
              activeIndex === idx
                ? "border-black"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <img
              src={item.src}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.button>
        ))}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="relative w-full max-w-4xl max-h-screen"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10"
              >
                <X size={32} />
              </button>

              <img
                src={activeItem.src}
                alt="Product fullscreen"
                className="w-full h-auto max-h-screen object-contain"
              />

              <button
                onClick={prevMedia}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2 bg-black/30 rounded-full"
              >
                <ChevronLeft size={32} />
              </button>

              <button
                onClick={nextMedia}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2 bg-black/30 rounded-full"
              >
                <ChevronRight size={32} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductMediaGallery;
