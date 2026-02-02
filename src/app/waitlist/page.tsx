"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Header1, Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { Star, Menu, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const features = [
    {
      icon: <Menu className="w-5 h-5" />,
      title: "Curated Access",
      description: "A considered selection of standout fashion pieces.",
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: "For Key Moments",
      description: "Designed for events, travel, and special occasions.",
    },
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: "Thoughtfully Managed",
      description: "Handled with care, quality and detailed attention",
    },
  ];

  const handleSubmit = async () => {
    if (!email) return;

    setLoading(true);

    try {
      await fetch("https://relisted-backend.onrender.com/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.error("Waitlist signup error:", err);
    } finally {
      setLoading(false);
      setSuccess(true); // ✅ ALWAYS show congrats
      setEmail("");
    }
  };


  return (
    <main className="relative min-h-screen w-full flex flex-col items-center bg-black text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/authbg.jpg"
          alt="Background"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
      </div>

      <div className="relative z-10 w-full max-w-[1200px] px-6 py-12 flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link href="/">
            <Image src="/images/logo.svg" alt="Logo" width={45} height={45} />
          </Link>
        </motion.div>

        {/* Status pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md mb-8">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <Paragraph1 className="text-xs uppercase tracking-[0.2em]">
            Join the waitlist
          </Paragraph1>
        </div>

        {/* Hero */}
        <div className="text-center max-w-2xl mb-10">
          <Header1 className="text-4xl md:text-6xl mb-6 leading-[1.1]">
            Get Early Access to <br /> the Future of Fashion
          </Header1>
          <Paragraph1 className="text-gray-300 md:text-lg">
            Access exceptional fashion for moments that matter — thoughtfully
            and effortlessly.
          </Paragraph1>
        </div>

        {/* Form / Success */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mb-10"
        >
          {!success ? (
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-4 focus:outline-none focus:border-white text-center md:text-left"
              />

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-gray-200 transition disabled:opacity-60"
              >
                {loading ? "Joining..." : "Join Waitlist"}
              </button>

              {error && (
                <Paragraph1 className="text-sm text-red-400 text-center">
                  {error}
                </Paragraph1>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl p-8"
            >
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-4" />
              <Paragraph3 className="text-xl font-bold mb-2">
                You’re on the list 🎉
              </Paragraph3>
              <Paragraph1 className="text-gray-300 text-sm">
                Congratulations! You’ve successfully joined the Relisted
                waitlist. We’ll notify you as soon as early access opens.
              </Paragraph1>
            </motion.div>
          )}
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-5xl mt-10">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl p-8 pt-12 text-center"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#E5E5E5] flex items-center justify-center text-black">
                {feature.icon}
              </div>
              <Paragraph3 className="text-lg font-bold mb-3">
                {feature.title}
              </Paragraph3>
              <Paragraph1 className="text-sm text-gray-400">
                {feature.description}
              </Paragraph1>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
