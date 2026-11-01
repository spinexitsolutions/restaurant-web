"use client";

import { motion } from "framer-motion";
import { useIntro } from "./providers";
import { EASE } from "./motion";

/** Editorial page header: oversized condensed type, letters rise in one by one. */
export default function PageHeader({ eyebrow, title, accent, intro, children }: { eyebrow: string; title: string; accent?: string; intro?: string; children?: React.ReactNode }) {
  const { done } = useIntro();
  const line = (text: string, cls: string, d: number) => (
    <span className={`block overflow-hidden pb-[0.04em] ${cls}`}>
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ y: "110%" }}
          animate={done ? { y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE, delay: d + i * 0.025 }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </span>
  );
  return (
    <header className="mx-auto max-w-[1400px] px-5 pb-12 pt-32 sm:px-10 sm:pb-16 sm:pt-40">
      <motion.div className="mb-8 flex items-center justify-between gap-4 border-b border-line pb-4" initial={{ opacity: 0 }} animate={done ? { opacity: 1 } : {}} transition={{ duration: 0.8 }}>
        <span className="eyebrow flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" /> {eyebrow}
        </span>
        <span className="eyebrow hidden text-muted sm:block">Noor — Bandra, Mumbai</span>
      </motion.div>
      <h1 className="mega text-[17vw] sm:text-[12vw] lg:text-[10vw] 2xl:text-[10rem]">
        {line(title, "", 0.1)}
        {accent && line(accent, "text-accent sm:pl-[8vw]", 0.25)}
      </h1>
      {(intro || children) && (
        <motion.div
          className="mt-10 flex flex-col justify-between gap-6 md:flex-row md:items-end"
          initial={{ opacity: 0, y: 16 }}
          animate={done ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
        >
          {intro && <p className="max-w-xl text-[17px] leading-relaxed text-muted text-pretty md:ml-auto md:order-2">{intro}</p>}
          {children}
        </motion.div>
      )}
    </header>
  );
}
