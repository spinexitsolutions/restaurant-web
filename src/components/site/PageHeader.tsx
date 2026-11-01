"use client";

import { motion } from "framer-motion";
import { useIntro } from "./providers";
import { EASE } from "./motion";

/** Centred, Apple-style page header with a soft blur-in. */
export default function PageHeader({ eyebrow, title, accent, intro, children }: { eyebrow: string; title: string; accent?: string; intro?: string; children?: React.ReactNode }) {
  const { done } = useIntro();
  const fade = (d: number) => ({
    initial: { opacity: 0, y: 20, filter: "blur(8px)" },
    animate: done ? { opacity: 1, y: 0, filter: "blur(0px)" } : {},
    transition: { duration: 1, ease: EASE, delay: d },
  });
  return (
    <header className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-14 pt-32 text-center sm:pb-20 sm:pt-40">
      <motion.p {...fade(0)} className="mb-4 text-[15px] font-semibold text-accent sm:text-[17px]">
        {eyebrow}
      </motion.p>
      <h1 className="display text-[40px] leading-[1.05] sm:text-[64px] lg:text-[80px]">
        <motion.span {...fade(0.1)} className="block">
          {title}
        </motion.span>
        {accent && (
          <motion.span {...fade(0.2)} className="block text-muted">
            {accent}
          </motion.span>
        )}
      </h1>
      {intro && (
        <motion.p {...fade(0.32)} className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted sm:text-[19px]">
          {intro}
        </motion.p>
      )}
      {children && (
        <motion.div {...fade(0.4)} className="mt-6">
          {children}
        </motion.div>
      )}
    </header>
  );
}
