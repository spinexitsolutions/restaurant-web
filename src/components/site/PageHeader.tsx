"use client";

import { motion } from "framer-motion";
import { useIntro } from "./providers";
import { EASE } from "./motion";

export default function PageHeader({ eyebrow, title, accent, intro, children }: { eyebrow: string; title: string; accent?: string; intro?: string; children?: React.ReactNode }) {
  const { done } = useIntro();
  return (
    <header className="mx-auto max-w-[1400px] px-5 pb-12 pt-32 sm:px-10 sm:pb-16 sm:pt-44">
      <motion.div className="eyebrow mb-6 flex items-center gap-3 text-muted" initial={{ opacity: 0 }} animate={done ? { opacity: 1 } : {}} transition={{ duration: 0.8 }}>
        <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {eyebrow}
      </motion.div>
      <h1 className="display text-[16vw] sm:text-[11vw] lg:text-[9vw] 2xl:text-[9.5rem]">
        <span className="block overflow-hidden pb-[0.05em]">
          <motion.span className="block" initial={{ y: "105%" }} animate={done ? { y: 0 } : {}} transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}>
            {title}
          </motion.span>
        </span>
        {accent && (
          <span className="block overflow-hidden pb-[0.05em]">
            <motion.span className="block italic text-accent" initial={{ y: "105%" }} animate={done ? { y: 0 } : {}} transition={{ duration: 1.1, ease: EASE, delay: 0.22 }}>
              {accent}
            </motion.span>
          </span>
        )}
      </h1>
      {(intro || children) && (
        <motion.div
          className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end"
          initial={{ opacity: 0, y: 16 }}
          animate={done ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE, delay: 0.4 }}
        >
          {intro && <p className="max-w-xl text-[17px] leading-relaxed text-muted text-pretty">{intro}</p>}
          {children}
        </motion.div>
      )}
    </header>
  );
}
