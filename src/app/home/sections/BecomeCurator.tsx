"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Header1, Paragraph1 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import { useUserStore } from "@/store/useUserStore";
import { useMe } from "@/lib/queries/auth/useMe";
import { useListerProfile } from "@/lib/queries/listers/useListerProfile";

export default function BecomeCurator() {
  const token = useUserStore((s) => s.token);
  const role = useUserStore((s) => s.role);
  const setUser = useUserStore((s) => s.setUser);
  const { data: user } = useMe();
  const { data: listerProfile } = useListerProfile();

  // Handle List Items click - set role to LISTER if needed
  const handleListItemsClick = () => {
    if (!token || !user) {
      // Not logged in, navigate to create account
      window.location.href = "/auth/create-account";
      return;
    }

    // If user is a lister with completed profile, go to dashboard
    if (role === "LISTER" && listerProfile) {
      window.location.href = "/listers/dashboard";
      return;
    }

    // If user is not already a LISTER, set them as LISTER for profile setup
    if (role !== "LISTER") {
      setUser({ role: "LISTER" });
    }

    // Navigate to profile setup (will show lister flow since role is now LISTER)
    window.location.href = "/auth/profile-setup";
  };

  return (
    <section className="relative w-full h-[250px] sm:h-screen overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/crotbg.jpg"
        alt="Hero Background"
        fill
        className="object-cover"
        priority
      />

      {/* Dark Overlay */}
      <motion.div
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Center Content */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6"
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
          {/* Title */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.8 }}
          >
            <Header1 className=" mb-[16px] sm:mb-12">Become a Lister</Header1>
          </motion.div>

          {/* Sub Text */}
          <motion.div
            className=" mb-[24px] sm:mb-8"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.9 }}
          >
            <Paragraph1 className=" max-w-[282px] sm:max-w-full">
              Turn your wardrobe into a new source of opportunity & earn
              effortlessly{" "}
            </Paragraph1>
          </motion.div>

          {/* Buttons */}
          <motion.div
            className="flex gap-4 justify-center"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 1 }}
          >
            <Button
              text="Start Listing"
              onClick={handleListItemsClick}
              backgroundColor="bg-white"
              color="text-black hover:text-white"
              border="border border-white"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
