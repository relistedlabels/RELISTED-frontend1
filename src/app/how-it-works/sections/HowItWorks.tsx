"use client";

import Button from "@/common/ui/Button";
import { Header1, Header5, Paragraph1 } from "@/common/ui/Text";
import { pathOptions } from "@/data/howItWorksSteps";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { useListerNavigation } from "@/app/how-it-works/hooks/useListerNavigation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const pathIcons = {
  shoppers: ShoppingBag,
  listers: Sparkles,
} as const;

export default function HowItWorks() {
  const { goToListerFlow } = useListerNavigation();

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="bg-white px-4 py-12 pt-[85px] sm:pt-[100px] md:px-0"
    >
      <div className="container mx-auto grid grid-cols-1 items-center md:grid-cols-2">
        <div className="hidden w-full md:flex md:order-1">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="relative h-[400px] w-full md:h-[calc(100vh-120px)] md:max-h-[760px]"
          >
            <Image
              src="/images/bagbg.jpg"
              alt="Fashion accessories styled among greenery"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          className="order-1 w-full pb-8 md:order-2 md:pl-12 sm:pb-0"
        >
          <motion.div
            className="mb-2 border-b border-gray-200"
            variants={fadeUp}
            transition={{ duration: 0.8 }}
          >
            <Paragraph1 className="mb-2 text-sm text-gray-500">HOW IT WORKS</Paragraph1>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: 0.8 }}>
            <Header1 className="mb-6 text-3xl font-semibold md:text-4xl">
              Rent, buy, or earn from fashion you love.
            </Header1>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: 0.8 }}>
            <Paragraph1 className="mb-8 max-w-xl text-base leading-relaxed text-black/80">
              Relisted connects shoppers who want standout pieces with listers who
              share their wardrobe. Browse the shop, request availability, verify
              with ID, pay from your wallet, and track delivery and returns in one place.
            </Paragraph1>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="mb-10 flex flex-wrap gap-4"
          >
            <Button
              text="Start Shopping"
              isLink
              href="/shop"
              backgroundColor="bg-black"
              color="text-white"
              border="border border-black"
            />
            <Button
              text="Become a Lister"
              onClick={goToListerFlow}
              backgroundColor="bg-transparent"
              border="border border-black"
              color="text-black hover:text-white"
            />
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {pathOptions.map((path) => {
              const Icon = pathIcons[path.id];
              return (
                <a
                  key={path.id}
                  href={path.href}
                  className="group flex h-full flex-col rounded-xl border border-black/10 bg-[#F7F5F2] p-5 transition hover:border-black/30 hover:bg-[#f1eee8]"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
                      <Icon className="h-4 w-4 text-white" aria-hidden />
                    </div>
                    <ArrowRight
                      className="h-4 w-4 text-black/40 transition group-hover:translate-x-0.5 group-hover:text-black"
                      aria-hidden
                    />
                  </div>
                  <Paragraph1 className="mb-1 text-xs uppercase tracking-[0.18em] text-black/50">
                    {path.label}
                  </Paragraph1>
                  <Header5 className="mb-2 text-lg font-semibold">{path.title}</Header5>
                  <Paragraph1 className="text-sm leading-relaxed text-black/70">
                    {path.description}
                  </Paragraph1>
                </a>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
