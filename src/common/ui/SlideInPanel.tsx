"use client";

import React from "react";
import { ArrowLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1 } from "@/common/ui/Text";
import {
  slidePanelBackdrop,
  slidePanelFooter,
  slidePanelHeader,
  slidePanelSheet,
  slidePanelTitle,
} from "@/common/ui/dashboardClasses";

interface SlideInPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  ariaLabel?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Optional extra classes on the scrollable body. */
  bodyClassName?: string;
}

const panelVariants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
};

export default function SlideInPanel({
  isOpen,
  onClose,
  title,
  ariaLabel,
  children,
  footer,
  bodyClassName = "min-h-0 flex-1 space-y-4 overflow-y-auto hide-scrollbar py-4",
}: SlideInPanelProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className={slidePanelBackdrop}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={slidePanelSheet}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel ?? title}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={panelVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={slidePanelHeader}>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-gray-500 transition hover:text-black xl:hidden"
                aria-label={`Close ${title}`}
              >
                <ArrowLeft size={20} />
              </button>
              <Paragraph1 className={slidePanelTitle}>{title}</Paragraph1>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-gray-500 transition hover:text-black"
                aria-label={`Close ${title}`}
              >
                <X className="hidden xl:block" size={20} />
              </button>
            </div>

            <div className={bodyClassName}>{children}</div>

            {footer ? <div className={slidePanelFooter}>{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
