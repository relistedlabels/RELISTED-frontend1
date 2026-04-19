"use client";

import Button from "@/common/ui/Button";
import { Header1, Header1Plus, Paragraph1 } from "@/common/ui/Text";
import Image from "next/image";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import { useMe } from "@/lib/queries/auth/useMe";
import { useListerProfile } from "@/lib/queries/listers/useListerProfile";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.25 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function HowItWorks() {
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

    // Navigate to profile-setup with returnUrl to indicate upgrade intent
    // The backend will handle role validation and upgrade if needed
    window.location.href = "/auth/profile-setup?upgrade=lister";
  };
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="bg-white px-4 md:px-0 py-12 pt-[85px] sm:pt-[100px]"
    >
      <div className="items-center grid grid-cols-1 md:grid-cols-2 mx-auto container">
        {/* Floating Image */}
        <div className="hidden md:flex order-2 md:order-1 w-full">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="relative w-full h-[400px] md:h-screen"
          >
            <Image
              src="/images/bagbg.jpg"
              alt="About Us"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>

        {/* Text Content */}
        <motion.div
          variants={containerVariants}
          className="order-1 md:order-2 pb-8 sm:pb-0 md:pl-12 w-full"
        >
          <motion.div
            className="mb-2 border-gray-200 border-b"
            variants={fadeUp}
            transition={{ duration: 0.8 }}
          >
            <Paragraph1 className="mb-2 text-gray-500 text-sm">
              HOW IT WORKS
            </Paragraph1>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: 0.8 }}>
            <Header1 className="mb-6 font-semibold text-3xl md:text-4xl">
              ACCESS. EARN. ELEVATE.
            </Header1>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: 0.8 }}>
            <Paragraph1 className="mb-6">
              Relisted makes fashion circular connecting those who want to wear
              standout pieces with those who own them. Whether you are here to
              rent for a moment or earn from your wardrobe, we have made it
              seamless.
            </Paragraph1>
          </motion.div>

          {/* Buttons */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="flex sm:justify-center- md:justify-start gap-4"
          >
            <motion.div>
              <Button
                text="Explore"
                isLink={true}
                href="/shop"
                backgroundColor="bg-black"
                color="text-white"
                border="border border-black"
              />
            </motion.div>

            <motion.div>
              <Button
                text="List Items"
                onClick={handleListItemsClick}
                backgroundColor="bg-transparent"
                border="border border-black"
                color="text-black hover:text-white"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
