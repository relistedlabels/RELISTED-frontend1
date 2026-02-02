"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Header1, Header1Plus, Header2, Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { Lock, ShieldCheck, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { devAuth } from "@/lib/devAuth";

export default function DevAccessPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const features = [
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "Restricted Access",
      description: "This environment is currently limited to approved users.",
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: "Pre-Launch Mode",
      description: "Features are still being tested and refined.",
    },
    {
      icon: <KeyRound className="w-5 h-5" />,
      title: "Internal Preview",
      description: "Early access for collaborators and stakeholders.",
    },
  ];

  const handleAccess = () => {
    const ok = devAuth.login(pin);

    if (!ok) {
      setError("Invalid access code");
      return;
    }

    router.replace("/");
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-start overflow-x-hidden bg-black text-white">
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

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1200px] px-6 py-12 flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link href="/" className="block">
            <Image src="/images/logo.svg" alt="Logo" width={45} height={45} />
          </Link>
        </motion.div>

        {/* Status Pill */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <Paragraph1 className="text-xs uppercase tracking-[0.2em] font-medium">
            Development Access
          </Paragraph1>
        </motion.div>

        {/* Hero */}
        <div className="text-center max-w-2xl mb-10">
          <Header1 className="text-4xl md:text-6xl mb-6 leading-[1.1]">
            Restricted <br /> Environment
          </Header1>
          <Paragraph1 className="text-gray-300 md:text-lg max-w-md mx-auto">
            Enter your access code to continue, or join the waitlist for public
            launch.
          </Paragraph1>
        </div>

        {/* PIN Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-md space-y-4 mb-8"
        >
          <input
            type="password"
            placeholder="Access code"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-4 focus:outline-none focus:border-white transition-colors text-center md:text-left"
          />

          {error && (
            <Paragraph1 className="text-sm text-red-400 text-center">
              {error}
            </Paragraph1>
          )}

          <button
            onClick={handleAccess}
            className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-gray-200 transition-all active:scale-[0.98]"
          >
            <Paragraph1 className="font-bold">Continue</Paragraph1>
          </button>

          <Link
            href="/waitlist"
            className="block text-center text-sm text-gray-400 hover:underline"
          >
            Join the waitlist instead
          </Link>
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
              <Paragraph1 className="text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </Paragraph1>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
