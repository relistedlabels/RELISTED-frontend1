"use client";

import { Header1Plus, Header5, Paragraph1 } from "@/common/ui/Text";
import Button from "@/common/ui/Button";
import { motion } from "framer-motion";
import { Truck, ShoppingBag, Box } from "lucide-react";

const deliverySteps = [
  {
    title: "Scheduled Delivery",
    description:
      "Once your item is approved, we coordinate delivery directly to your address anywhere in Lagos.",
    icon: Truck,
  },
  {
    title: "Wear & Enjoy",
    description:
      "Your item arrives cleaned, verified, and ready for your selected rental period.",
    icon: ShoppingBag,
  },
  {
    title: "Pickup & Return",
    description:
      "When your rental ends, we arrange pickup and return inspection so the item is ready for the next renter.",
    icon: Box,
  },
];

export default function DeliverySection() {
  return (
    <section id="delivery" className="w-full bg-black text-white py-20">
      {/* Top Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="text-center flex flex-col items-center px-4 max-w-3xl mx-auto mb-16"
      >
        <Paragraph1 className="tracking-widest text-sm">DELIVERY</Paragraph1>
        <hr className="mb-8 w-full" />

        <Header1Plus className="mb-6">
          DELIVERED
          <br />
          ACROSS LAGOS
        </Header1Plus>

        <Paragraph1 className="text-gray-300 mb-8 text-sm md:text-base">
          Relisted coordinates delivery and returns through trusted logistics
          partners so your experience stays simple and reliable.
        </Paragraph1>

        <Button
          text="Start Shopping"
          isLink={true}
          href="/shop"
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
        className="grid grid-cols-1 md:grid-cols-3 container mx-auto px-4 sm:px-0 gap-4 sm:gap-10"
      >
        {deliverySteps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
              }}
              className="flex flex-col border border-white/20 rounded p-6 bg-white/20"
            >
              {/* Icon and Title Row */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20 border border-white/20 flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <Header5 className="text-lg font-semibold">
                  {step.title}
                </Header5>
              </div>

              {/* Description */}
              <Paragraph1 className="text-gray-300 text-sm">
                {step.description}
              </Paragraph1>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
