
// SuspendUserButton.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

const SuspendUserButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full px-4 py-3 border border-red-400 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition"
      >
        <Paragraph1>Suspend User</Paragraph1>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm bg-white rounded-xl p-6 text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <span className="text-red-500 text-lg">⚠</span>
              </div>

              <Paragraph1 className="font-semibold mb-2">
                Suspend User Account
              </Paragraph1>

              <Paragraph3 className="text-gray-500 mb-6">
                Are you sure you want to suspend Chioma Adeyemi?
                <br />
                They’ll lose access until reactivated.
              </Paragraph3>

              <div className="flex gap-3">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <Paragraph1>Cancel</Paragraph1>
                </button>

                <button
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  <Paragraph1>Confirm Suspension</Paragraph1>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SuspendUserButton
