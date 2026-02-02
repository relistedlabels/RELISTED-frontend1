"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import { useProductDetailsStore } from "@/store/useProductDetailsStore";

interface MediaItem {
  type: "image" | "video";
  src: string;
}

const ProductMediaGallery: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const product = useProductDetailsStore((state) => state.product);

  const uploads = product?.attachments?.uploads ?? [];
  if (!product || uploads.length === 0) {
    return <div className="text-center py-8">No media available</div>;
  }

  const media: MediaItem[] = uploads.map((u) => ({
    type: "image" as const,
    src: u.url,
  }));

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
              transition={{ duration: 0.25 }}
              className="w-full h-full object-contain"
            />
          ) : (
            <motion.video
              key={activeItem.src}
              src={activeItem.src}
              controls
              autoPlay
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full object-contain"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Thumbnails */}
      <div className="sm:w-full w-[340px] flex hide-scrollbar overflow-hidden overflow-x-auto">
        <div className="mt-3 flex gap-3">
          {media.map((item, index) => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative h-20 w-20 rounded-lg overflow-hidden border transition ${
                index === activeIndex
                  ? "border-black"
                  : "border-transparent hover:border-black/40"
              }`}
            >
              {item.type === "image" ? (
                <img
                  src={item.src}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-black/50 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Modal Viewer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-white"
            >
              <X className="w-7 h-7" />
            </button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={prevMedia}
              className="absolute left-6 text-white p-2 rounded-full bg-black/40 hover:bg-black/60"
            >
              <ChevronLeft className="w-8 h-8" />
            </motion.button>

            <AnimatePresence mode="wait">
              {activeItem.type === "image" ? (
                <motion.img
                  key={activeItem.src}
                  src={activeItem.src}
                  alt="Preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="max-h-[90vh] max-w-[90vw] object-contain"
                />
              ) : (
                <motion.video
                  key={activeItem.src}
                  src={activeItem.src}
                  controls
                  autoPlay
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="max-h-[90vh] max-w-[90vw] object-contain"
                />
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={nextMedia}
              className="absolute right-6 text-white p-2 rounded-full bg-black/40 hover:bg-black/60"
            >
              <ChevronRight className="w-8 h-8" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductMediaGallery;
