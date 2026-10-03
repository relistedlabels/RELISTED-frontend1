"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import SignInForm from "./components/SignInForm";

function Page() {
  return (
    <div
      className="relative w-full h-full min-h-screen bg-black bg-cover bg-center"
      style={{ backgroundImage: "url('/images/authbg.jpg')" }}
    >
      <Link
        href="/"
        className="absolute top-4 left-4 z-10 flex items-center justify-center rounded-full bg-white/90 p-2 text-gray-800 hover:bg-white sm:top-6 sm:left-6"
        aria-label="Close and go back"
      >
        <X className="h-5 w-5" />
      </Link>
      {/* Dark Overlay */}
      <motion.div
        className="absolute inset-0 bg-black/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Center Content */}
      <motion.div
        className="relative flex flex-col sm:items-center justify-center  text-white px-0 sm:px-6 sm:py-20"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.25,
              },
            },
          }}
        >
          <SignInForm />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Page;
