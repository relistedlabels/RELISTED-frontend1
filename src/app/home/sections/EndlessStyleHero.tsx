"use client";

import { motion } from "framer-motion";
import { Header1, FashionLead } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import HeroVideo from "./HeroVideo";
import { useUserStore } from "@/store/useUserStore";
import { useMe } from "@/lib/queries/auth/useMe";
import { useListerProfile } from "@/lib/queries/listers/useListerProfile";

const RENT_SHOP_HREF = "/shop?listingType=RENTAL,RENT_OR_RESALE";
const BUY_SHOP_HREF = "/shop?listingType=RESALE,RENT_OR_RESALE";

export default function EndlessStyleHero() {
  const token = useUserStore((s) => s.token);
  const role = useUserStore((s) => s.role);
  const { data: user } = useMe();
  const { data: listerProfile } = useListerProfile(role === "LISTER");

  const handleListerClick = () => {
    if (!token || !user) {
      window.location.href = "/auth/create-account";
      return;
    }
    if (role === "LISTER" && listerProfile) {
      window.location.href = "/listers/dashboard";
      return;
    }
    window.location.href = "/auth/profile-setup?upgrade=lister";
  };

  return (
    <section className="relative bg-black w-full min-h-[100dvh] min-h-[100svh] xl:min-h-screen overflow-hidden">
      <HeroVideo />

      <motion.div
        className="absolute inset-0 bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      <motion.div
        className="absolute inset-0 flex flex-col justify-center items-center px-6 pt-16 pb-24 text-white text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      >
        <motion.div
          className="max-w-4xl"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.25 } },
          }}
        >
          <motion.div
            className="mb-6 sm:mb-8"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.8 }}
          >
            <Header1 className="!text-[52px] sm:!text-[100px] !leading-[1.08] sm:!leading-[1.05] pb-1 text-balance">
              Your wardrobe just got bigger.
            </Header1>
          </motion.div>

          <motion.div
            className="mb-6 sm:mb-8 max-w-lg mx-auto"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.9 }}
          >
            <FashionLead className="text-white/90 text-base sm:text-lg xl:text-xl leading-relaxed tracking-wide text-balance">
              Rent or shop pre-loved fashion from wardrobes you love.
            </FashionLead>
          </motion.div>

          <motion.div
            className="flex flex-row justify-center items-center gap-3 sm:gap-4 w-full max-w-sm mx-auto origin-center xl:scale-[1.2]"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 1 }}
          >
            <Button
              text="RENT"
              isLink={true}
              href={RENT_SHOP_HREF}
              backgroundColor="bg-white"
              color="text-black hover:text-white"
              border="border border-white"
            />
            <Button
              text="SHOP RESALE"
              isLink={true}
              href={BUY_SHOP_HREF}
              backgroundColor="bg-transparent"
              border="border border-white"
              color="text-white"
            />
          </motion.div>

          <motion.div
            className="mt-5"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
          >
            <button
              type="button"
              onClick={handleListerClick}
              className="text-sm text-white/80 underline underline-offset-4 hover:text-white transition-colors"
            >
              Want to list your items?
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
