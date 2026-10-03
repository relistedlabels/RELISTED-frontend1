"use client";

import Button from "@/common/ui/Button";
import { Header1Plus, Header5, Paragraph1 } from "@/common/ui/Text";
import type { HowItWorksStep } from "@/data/howItWorksSteps";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useListerNavigation } from "../hooks/useListerNavigation";

type FlowSectionTheme = "dark" | "olive" | "light";

const themeStyles: Record<
  FlowSectionTheme,
  {
    section: string;
    label: string;
    description: string;
    card: string;
    iconWrap: string;
    stepText: string;
    divider: string;
  }
> = {
  dark: {
    section: "bg-black text-white",
    label: "text-white/70",
    description: "text-gray-300",
    card: "border border-white/20 bg-white/10",
    iconWrap: "bg-white/15 border border-white/20",
    stepText: "text-gray-300",
    divider: "border-white/20",
  },
  olive: {
    section: "bg-[#3A3A32] text-white",
    label: "text-white/70",
    description: "text-gray-300",
    card: "border border-white/20 bg-white/10",
    iconWrap: "bg-white/15 border border-white/20",
    stepText: "text-gray-300",
    divider: "border-white/20",
  },
  light: {
    section: "bg-[#F7F5F2] text-black",
    label: "text-black/50",
    description: "text-black/70",
    card: "border border-black/10 bg-white",
    iconWrap: "bg-black border border-black",
    stepText: "text-black/70",
    divider: "border-black/10",
  },
};

type FlowSectionProps = {
  id: string;
  label: string;
  title: ReactNode;
  description: string;
  steps: HowItWorksStep[];
  theme: FlowSectionTheme;
  ctaText: string;
  ctaHref?: string;
  ctaMode?: "link" | "lister";
};

export default function FlowSection({
  id,
  label,
  title,
  description,
  steps,
  theme,
  ctaText,
  ctaHref,
  ctaMode = "link",
}: FlowSectionProps) {
  const { goToListerFlow } = useListerNavigation();
  const styles = themeStyles[theme];
  const isLight = theme === "light";

  return (
    <section id={id} className={`w-full py-20 ${styles.section}`}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="mx-auto mb-14 flex max-w-3xl flex-col items-center px-4 text-center"
      >
        <Paragraph1
          className={`mb-2 text-sm uppercase tracking-[0.2em] ${styles.label}`}
        >
          {label}
        </Paragraph1>
        <hr className={`mb-8 w-full ${styles.divider}`} />

        <Header1Plus className="mb-6">{title}</Header1Plus>

        <Paragraph1 className={`mb-8 text-sm md:text-base ${styles.description}`}>
          {description}
        </Paragraph1>

        {ctaMode === "lister" ? (
          <Button
            text={ctaText}
            onClick={goToListerFlow}
            backgroundColor={isLight ? "bg-black" : "bg-white"}
            border={isLight ? "border border-black" : "border border-white"}
            color={isLight ? "text-white" : "text-black hover:text-white"}
          />
        ) : (
          <Button
            text={ctaText}
            isLink
            href={ctaHref ?? "/shop"}
            backgroundColor={isLight ? "bg-black" : "bg-white"}
            border={isLight ? "border border-black" : "border border-white"}
            color={isLight ? "text-white" : "text-black hover:text-white"}
          />
        )}
      </motion.div>

      <motion.ol
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12 } },
        }}
        className={`mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 md:grid-cols-2 ${
          steps.length >= 5 ? "lg:grid-cols-3 xl:grid-cols-5" : "lg:grid-cols-3"
        }`}
      >
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.li
              key={step.title}
              variants={{
                hidden: { opacity: 0, y: 32 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              className={`flex h-full flex-col rounded-xl p-6 ${styles.card}`}
            >
              <div className="mb-5 flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${styles.iconWrap}`}
                >
                  <Icon
                    className={`h-5 w-5 ${isLight ? "text-white" : "text-white"}`}
                    aria-hidden
                  />
                </div>
                <span
                  className={`text-xs font-semibold uppercase tracking-[0.18em] ${styles.label}`}
                >
                  Step {index + 1}
                </span>
              </div>

              <Header5 className="mb-3 text-lg font-semibold">{step.title}</Header5>
              <Paragraph1 className={`text-sm leading-relaxed ${styles.stepText}`}>
                {step.description}
              </Paragraph1>
            </motion.li>
          );
        })}
      </motion.ol>
    </section>
  );
}
