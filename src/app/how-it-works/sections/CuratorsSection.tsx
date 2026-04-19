"use client";

import Image from "next/image";
import { Header1Plus, Header5, Paragraph1 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import { curatorSteps } from "@/data/curatorSteps";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import { useMe } from "@/lib/queries/auth/useMe";
import { useListerProfile } from "@/lib/queries/listers/useListerProfile";

export default function CuratorsSection() {
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
    <section className="bg-[#3A3A32] py-20 w-full text-white">
      {/* Top Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="flex flex-col items-center mx-auto mb-16 px-4 max-w-3xl text-center"
      >
        <Paragraph1 className="text-sm uppercase tracking-widest">
          Listers
        </Paragraph1>
        <hr className="mb-8 w-full" />

        <Header1Plus className="mb-6">
          TURN YOUR CLOSET
          <br />
          INTO A STREAM OF INCOME.
        </Header1Plus>

        <Paragraph1 className="mb-8 text-gray-300 text-sm md:text-base">
          Share your best pieces, earn from every rental, and join a community
          redefining how fashion is experienced and valued.
        </Paragraph1>

        <Button
          text="Become a Lister"
          onClick={handleListItemsClick}
          backgroundColor="bg-white"
          border="border border-white"
          color="text-black hover:text-white"
        />
      </motion.div>

      {/* Cards Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.25 } },
        }}
        className="gap-4 sm:gap-10 grid grid-cols-1 md:grid-cols-3 mx-auto px-4 sm:px-0 container"
      >
        {curatorSteps.map((step, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
            }}
            className="flex flex-col items-start"
          >
            {/* Image - Hidden on mobile */}
            <motion.div
              className="hidden md:block relative mb-6 w-full h-72 overflow-hidden"
              initial={{ scale: 1.1, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              {/* Number Circle */}
              <div className="bottom-3 left-3 z-20 absolute flex justify-center items-center bg-black/50 border rounded-full w-10 h-10 font-semibold text-white text-sm">
                <p className="text-[32px]">{index + 1}</p>
              </div>

              {/* Image */}
              <Image
                src={step.image}
                alt={step.title}
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Mobile Card Layout */}
            <div className="md:hidden flex items-start gap-4 bg-white/10 mb-6 p-6 border border-white/40 rounded w-full">
              <div className="flex flex-shrink-0 flex-none justify-center items-center bg-white/30 border border-white/20 rounded-full w-10 h-10 font-semibold text-white">
                {index + 1}
              </div>
              <div className="flex flex-col">
                <Header5 className="mb-2 font-semibold text-lg">
                  {step.title}
                </Header5>
                <Paragraph1 className="text-gray-300 text-sm">
                  {step.description}
                </Paragraph1>
              </div>
            </div>

            {/* Desktop Text */}
            <div className="hidden md:block w-full">
              <Header5 className="mb-2 font-semibold text-lg">
                {step.title}
              </Header5>

              <Paragraph1 className="text-gray-300 text-sm">
                {step.description}
              </Paragraph1>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
