"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Monitor } from "lucide-react";

export default function MobileDesktopRecommendation() {
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768; // md breakpoint in Tailwind
      setIsMobile(isMobileDevice);

      if (isMobileDevice) {
        // Show recommendation after 5 seconds on mobile
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 5000);
        return () => clearTimeout(timer);
      }
    };

    checkMobile();

    // Handle window resize
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && isMobile && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVisible(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Monitor className="text-white flex-shrink-0" size={24} />
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Better Experience on Desktop
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="text-white/70 hover:text-white transition p-1 -mr-2 flex-shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 text-sm leading-relaxed mb-6">
                  The admin dashboard is optimized for desktop viewing. For the
                  best experience managing your content and analytics, we
                  recommend using a desktop or tablet device.
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsVisible(false)}
                    className="flex-1 py-2 px-4 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="flex-1 py-2 px-4 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
