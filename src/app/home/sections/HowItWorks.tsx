"use client";

import { Header1Plus, Header2, Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  CheckCircle2,
  CreditCard,
  Package,
  RotateCcw,
} from "lucide-react";

interface Step {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
}

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps: Step[] = [
    {
      id: 1,
      icon: <Search className="w-16 h-16 lg:w-24 lg:h-24" />,
      title: "Browse & Discover",
      description: "Explore our curated collection of luxury fashion",
      details: [
        "Browse thousands of designer pieces from trusted listers",
        "View detailed descriptions and multiple photos",
        "Filter by style, size, brand, and price range",
        "Read authentic reviews from other renters",
      ],
    },
    {
      id: 2,
      icon: <Calendar className="w-16 h-16 lg:w-24 lg:h-24" />,
      title: "Select Dates",
      description: "Choose your rental period",
      details: [
        "Pick your desired rental start and end dates",
        "See real-time availability for each item",
        "View delivery and return schedules",
        "Get instant pricing based on your dates",
      ],
    },
    {
      id: 3,
      icon: <CheckCircle2 className="w-16 h-16 lg:w-24 lg:h-24" />,
      title: "Lister Confirms",
      description: "Lister verifies availability & accepts order",
      details: [
        "Lister reviews your rental request",
        "Confirms product availability for your dates",
        "Provides shipping details and timeline",
        "You receive instant confirmation notification",
      ],
    },
    {
      id: 4,
      icon: <CreditCard className="w-16 h-16 lg:w-24 lg:h-24" />,
      title: "Checkout & Pay",
      description: "Secure payment for your rental",
      details: [
        "Multiple secure payment options available",
        "Transparent pricing with no hidden fees",
        "Instant order confirmation and receipt",
        "Track your order in real-time",
      ],
    },
    {
      id: 5,
      icon: <Package className="w-16 h-16 lg:w-24 lg:h-24" />,
      title: "Receive & Wear",
      description: "Items delivered to your doorstep",
      details: [
        "Premium packaging ensures items arrive perfect",
        "Free shipping on all rental orders",
        "Try on at your convenience with care guide",
        "Flexible wearing period within rental dates",
      ],
    },
    {
      id: 6,
      icon: <RotateCcw className="w-16 h-16 lg:w-24 lg:h-24" />,
      title: "Return at Due Date",
      description: "Easy and hassle-free returns",
      details: [
        "Prepaid return shipping label provided",
        "Simple condition check process",
        "Fast refund within 48 hours",
        "No additional fees or penalties",
      ],
    },
  ];

  // Auto-rotate through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [steps.length]);

  const currentStep = steps[activeStep];

  return (
    <section className="w-full mx-auto px-4 sm:px-0 container py-8 sm:py-[80px] flex flex-col items-center bg-gradient-to-b from-white via-gray-50/30 to-white">
      {/* SECTION TITLE */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <Header1Plus className="text-center tracking-wider">
          HOW IT WORKS
        </Header1Plus>
        <Paragraph1 className="text-center text-gray-500 mt-3 max-w-2xl text-lg">
          Your journey from discovering luxury fashion to returning it with
          ease. Six simple steps to style without the commitment.
        </Paragraph1>
      </motion.div>

      {/* VISUAL FLOW DIAGRAM */}
      <div className="w-full sm:pl-20 mt-16 hidden lg:flex items-center justify-between px-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <motion.div
              onClick={() => setActiveStep(index)}
              className="cursor-pointer relative"
              animate={
                activeStep === index
                  ? {
                      scale: [1, 1.15, 1],
                    }
                  : { scale: 1 }
              }
              transition={{
                duration: 0.8,
                repeat: activeStep === index ? Infinity : 0,
              }}
            >
              {/* CIRCLE BACKGROUND */}
              <motion.div
                className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-xl transition-all relative ${
                  activeStep === index
                    ? "bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-2xl"
                    : index < activeStep
                      ? "bg-gradient-to-br from-gray-700 to-black  text-white"
                      : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700"
                }`}
              >
                {/* PULSING RING FOR ACTIVE STEP */}
                {activeStep === index && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-gray-600"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [1, 0, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  />
                )}

                <span>{step.id}</span>
              </motion.div>

              {/* STEP LABEL */}
              <div className="absolute top-24 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <Paragraph1
                  className={`font-semibold text-xs transition-all ${
                    activeStep === index ? "text-black" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </Paragraph1>
              </div>
            </motion.div>

            {/* CONNECTING LINE */}
            {index < steps.length - 1 && (
              <motion.div
                className="flex-1 h-1 mx-2 rounded-full"
                animate={{
                  backgroundColor: index < activeStep ? "#374151" : "#d1d5db",
                }}
                transition={{ duration: 0.4 }}
              />
            )}
          </div>
        ))}
      </div>

      {/* INTERACTIVE STEPS CONTAINER */}
      <div className="w-full mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* LEFT SIDE - STEPS LIST */}
        <div className="flex flex-col gap-3">
          {steps.map((step, index) => (
            <motion.button
              key={step.id}
              onClick={() => setActiveStep(index)}
              className={`p-5 sm:p-6 rounded-2xl text-left transition-all duration-300 ${
                activeStep === index
                  ? "bg-gradient-to-r from-gray-800 to-black text-white shadow-2xl"
                  : "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 hover:border-gray-400"
              }`}
              whileHover={{ scale: activeStep === index ? 1.02 : 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                    activeStep === index
                      ? "bg-white/20 text-white"
                      : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700"
                  }`}
                  animate={{
                    scale: activeStep === index ? 1.1 : 1,
                  }}
                >
                  {step.id}
                </motion.div>
                <div className="flex-1">
                  <Paragraph2 className="font-bold text-base sm:text-lg">
                    {step.title}
                  </Paragraph2>
                  <Paragraph1
                    className={`text-sm mt-1 ${
                      activeStep === index ? "opacity-90" : "opacity-60"
                    }`}
                  >
                    {step.description}
                  </Paragraph1>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* RIGHT SIDE - DETAILED CONTENT */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-slate-50 p-8 sm:p-12 rounded-3xl border-2 border-gray-200 shadow-2xl relative overflow-hidden"
        >
          {/* DECORATIVE BACKGROUND ELEMENTS */}
          <motion.div
            className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-gray-300 to-gray-200 rounded-full opacity-20 blur-3xl"
            animate={{
              x: [0, 20, -20, 0],
              y: [0, -20, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
            }}
          />

          {/* ANIMATED ICON */}
          <motion.div
            className="flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full shadow-lg mb-8 text-gray-700 relative z-10"
            animate={{
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {currentStep.icon}
          </motion.div>

          {/* CONTENT */}
          <Header2 className="text-center mb-4 text-gray-900 relative z-10">
            {currentStep.title}
          </Header2>
          <Paragraph1 className="text-center text-gray-600 mb-8 text-lg relative z-10">
            {currentStep.description}
          </Paragraph1>

          {/* DETAILS LIST */}
          <div className="w-full space-y-4 relative z-10">
            {currentStep.details.map((detail, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.12 }}
                className="flex items-start gap-3 group"
              >
                <motion.div
                  className="flex-shrink-0 w-3 h-3 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full mt-2"
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: index * 0.15,
                    repeat: Infinity,
                  }}
                />
                <Paragraph3 className="text-gray-700 group-hover:text-gray-900 transition-colors">
                  {detail}
                </Paragraph3>
              </motion.div>
            ))}
          </div>

          {/* PROGRESS INDICATOR */}
          <div className="w-full mt-10 space-y-3 relative z-10">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gray-800 to-gray-900 rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width: `${((activeStep + 1) / steps.length) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Paragraph2 className="text-gray-800 font-semibold">
                Step {activeStep + 1} of {steps.length}
              </Paragraph2>
              {/* <Paragraph2 className="text-gray-500 text-sm">
                Auto-advancing in 5s
              </Paragraph2> */}
            </div>
          </div>
        </motion.div>
      </div>

      {/* MOBILE PROGRESS DOTS */}
      <div className="flex lg:hidden gap-3 mt-12 justify-center">
        {steps.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setActiveStep(index)}
            className={`rounded-full transition-all ${
              activeStep === index
                ? "bg-gradient-to-r from-gray-800 to-gray-900 w-10 h-3 shadow-lg"
                : "bg-gray-300 w-3 h-3"
            }`}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>
    </section>
  );
}
