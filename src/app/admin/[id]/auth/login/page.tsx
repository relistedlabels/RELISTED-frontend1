"use client";

import React from "react";
import { motion } from "framer-motion";
import AdminSignInForm from "./components/AdminSignInForm";

export default function AdminLoginPage() {
  return (
    <div
      className="relative w-full h-full min-h-screen bg-black bg-cover bg-center"
      style={{ backgroundImage: "url('/images/authbg.jpg')" }}
    >
      {/* Dark Overlay */}
      <motion.div
        className="absolute inset-0 bg-black/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Center Content */}
      <motion.div
        className="relative flex flex-col sm:items-center justify-center min-h-screen text-white px-0 sm:px-6 sm:py-20"
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
          <AdminSignInForm />
        </motion.div>
      </motion.div>
    </div>
  );
}
