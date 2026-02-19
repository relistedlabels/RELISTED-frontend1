"use client";

import React, { useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1 } from "@/common/ui/Text";
import AddressInputForm from "./AddressInputForm";
import { useUpdateProfile } from "@/lib/mutations/user/useUpdateProfile";

// --------------------
// Slide-in Address Modal
// --------------------
interface ChangeAddressPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangeAddressPanel: React.FC<ChangeAddressPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const updateProfile = useUpdateProfile();

  const variants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
  };

  // Close modal on successful update
  React.useEffect(() => {
    if (updateProfile.isSuccess) {
      const timer = setTimeout(onClose, 1000); // Give user time to see success message
      return () => clearTimeout(timer);
    }
  }, [updateProfile.isSuccess, onClose]);

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
            className="fixed top-0 right-0 h-screen hide-scrollbar overflow-y-auto bg-white shadow-2xl px-4 flex flex-col w-full sm:w-114"
            role="dialog"
            aria-modal="true"
            aria-label="Change delivery address"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between sticky top-0 items-center pb-4 border-b border-gray-100 pt-6 z-10 bg-white">
              <button
                onClick={onClose}
                className="text-gray-500 xl:hidden hover:text-black p-1 rounded-full transition"
                aria-label="Close address modal"
              >
                <ArrowLeft size={20} />
              </button>

              <Paragraph1 className="font-bold tracking-widest text-gray-800">
                Change Address
              </Paragraph1>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-black p-1 rounded-full transition"
                aria-label="Close address modal"
              >
                <X className="hidden xl:flex" size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="grow pt-4 pb-20">
              <AddressInputForm />
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
const ChangeAddress: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="border px-4 items-center rounded-lg bg-black text-white justify-center w-fit py-2 flex gap-1 cursor-pointer font-semibold hover:bg-gray-900 text-sm transition"
      >
        <Paragraph1>Update</Paragraph1>
      </button>

      {/* Address Modal */}
      <ChangeAddressPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ChangeAddress;
