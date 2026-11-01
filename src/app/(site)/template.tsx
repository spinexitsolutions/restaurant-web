"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    __noorNavigated?: boolean;
  }
}

/** Gentle page transition: content eases up out of a soft blur (skipped on first load). */
export default function Template({ children }: { children: React.ReactNode }) {
  const [animate] = useState(() => typeof window !== "undefined" && !!window.__noorNavigated);
  useEffect(() => {
    window.__noorNavigated = true;
  }, []);
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 24, filter: "blur(10px)" } : false}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
