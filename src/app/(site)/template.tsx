"use client";

import { motion } from "framer-motion";
import { useSite } from "@/components/site/providers";

let firstRender = true;

/**
 * Route transition: on every navigation an accent panel sweeps up off the
 * screen with the brand name, while the new page eases in underneath.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const s = useSite();
  const animate = !firstRender;
  firstRender = false;
  return (
    <>
      {animate && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[95] flex items-center justify-center bg-accent text-paper"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.9, ease: [0.87, 0, 0.13, 1], delay: 0.15 }}
        >
          <motion.span
            className="mega text-[22vw] sm:text-[12vw]"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            {s.brand.name}
          </motion.span>
        </motion.div>
      )}
      <motion.div
        initial={animate ? { opacity: 0, y: 60 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
      >
        {children}
      </motion.div>
    </>
  );
}
