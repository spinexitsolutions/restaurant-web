"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { GalleryImage } from "@/lib/types";
import { useLenis } from "./providers";
import { EASE } from "./motion";

export default function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const lenis = useLenis();
  useEffect(() => {
    if (open !== null) lenis.current?.stop();
    else lenis.current?.start();
    const onKey = (e: KeyboardEvent) => {
      if (open === null) return;
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((open + 1) % images.length);
      if (e.key === "ArrowLeft") setOpen((open - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length, lenis]);

  return (
    <>
      <div className="mx-auto grid max-w-[1400px] auto-rows-[44vw] grid-cols-2 gap-3 px-3 pb-32 sm:auto-rows-[30vw] sm:gap-4 sm:px-10 md:grid-cols-3 md:auto-rows-[22vw] lg:auto-rows-[19vw]">
        {images.map((g, i) => (
          <motion.button
            key={g.id}
            onClick={() => setOpen(i)}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -5% 0px" }}
            transition={{ duration: 0.9, ease: EASE, delay: (i % 3) * 0.08 }}
            className={`group relative overflow-hidden rounded-[22px] ${g.span === "tall" ? "row-span-2" : g.span === "wide" ? "col-span-2" : ""}`}
            data-cursor="Open"
          >
            <motion.img layoutId={`g-${g.id}`} src={g.image} alt={g.caption} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
            <span className="glass absolute bottom-3 left-3 rounded-full px-3 py-1 text-[12px] text-paper opacity-0 transition group-hover:opacity-100">{g.caption}</span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {open !== null && (
          <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.img
              layoutId={`g-${images[open].id}`}
              src={images[open].image}
              alt={images[open].caption}
              className="max-h-[80vh] max-w-full rounded-[22px] object-contain"
              onClick={(e) => e.stopPropagation()}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) setOpen((open + 1) % images.length);
                if (info.offset.x > 60) setOpen((open - 1 + images.length) % images.length);
              }}
            />
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4 text-paper" onClick={(e) => e.stopPropagation()}>
              <button aria-label="Previous" onClick={() => setOpen((open - 1 + images.length) % images.length)} className="grid h-12 w-12 place-items-center rounded-full bg-white/10"><ArrowLeft size={18} /></button>
              <span className="min-w-32 text-center text-[14px]">{images[open].caption} · {open + 1}/{images.length}</span>
              <button aria-label="Next" onClick={() => setOpen((open + 1) % images.length)} className="grid h-12 w-12 place-items-center rounded-full bg-white/10"><ArrowRight size={18} /></button>
            </div>
            <button aria-label="Close" onClick={() => setOpen(null)} className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-paper"><X size={18} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
