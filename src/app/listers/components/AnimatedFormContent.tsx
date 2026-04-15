"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProductDraftStore } from "@/store/useProductDraftStore";

interface AnimatedFormContentProps {
  children: React.ReactNode;
}

export function AnimatedFormContent({ children }: AnimatedFormContentProps) {
  const saleType = useProductDraftStore((state) => state.data.saleType);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={saleType}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
