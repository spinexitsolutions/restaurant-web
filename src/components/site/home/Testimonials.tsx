"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { EASE, SectionLabel } from "../motion";

const DURATION = 7000;

export default function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const t = items[i];
  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = setTimeout(() => setI((v) => (v + 1) % items.length), DURATION);
    return () => clearTimeout(id);
  }, [i, paused, items.length]);
  if (!t) return null;
  const go = (d: number) => setI((v) => (v + d + items.length) % items.length);

  return (
    <section className="relative overflow-hidden bg-accent-soft/40 py-28 sm:py-36" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <div className="mx-auto max-w-[1200px] px-5 sm:px-10">
        <SectionLabel index="08" className="mb-12 text-muted">
          Kind words
        </SectionLabel>
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) go(1);
            if (info.offset.x > 60) go(-1);
          }}
          className="min-h-[340px] cursor-grab active:cursor-grabbing sm:min-h-[300px]"
        >
          <AnimatePresence mode="wait">
            <motion.figure key={t.id} initial="h" animate="s" exit="x">
              <div className="mb-6 flex gap-1 text-accent">
                {Array.from({ length: t.rating }).map((_, k) => (
                  <motion.span key={k} variants={{ h: { scale: 0 }, s: { scale: 1, transition: { delay: k * 0.05 } }, x: { opacity: 0 } }}>
                    <Star size={18} fill="currentColor" />
                  </motion.span>
                ))}
              </div>
              <blockquote className="display text-[28px] leading-[1.2] sm:text-[40px] lg:text-[46px]">
                {t.quote.split(" ").map((w, k) => (
                  <span key={k} className="inline-block overflow-hidden align-bottom">
                    <motion.span
                      className="inline-block"
                      variants={{
                        h: { y: "100%" },
                        s: { y: "0%", transition: { duration: 0.8, ease: EASE, delay: k * 0.02 } },
                        x: { y: "-100%", transition: { duration: 0.35, ease: EASE, delay: k * 0.005 } },
                      }}
                    >
                      {k === 0 ? "“" : ""}
                      {w}
                      {k === t.quote.split(" ").length - 1 ? "”" : ""}&nbsp;
                    </motion.span>
                  </span>
                ))}
              </blockquote>
              <motion.figcaption variants={{ h: { opacity: 0, y: 10 }, s: { opacity: 1, y: 0, transition: { delay: 0.4 } }, x: { opacity: 0 } }} className="mt-8 flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-ink font-medium text-paper">{t.name[0]}</span>
                <span>
                  <span className="block font-medium">{t.name}</span>
                  <span className="text-[14px] text-muted">{t.role}</span>
                </span>
              </motion.figcaption>
            </motion.figure>
          </AnimatePresence>
        </motion.div>

        <div className="mt-12 flex items-center gap-6">
          <div className="flex flex-1 gap-2">
            {items.map((x, k) => (
              <button key={x.id} onClick={() => setI(k)} aria-label={`Testimonial ${k + 1}`} className="relative h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
                {k === i ? (
                  <motion.span
                    key={`${i}-${paused}`}
                    className="absolute inset-y-0 left-0 bg-ink"
                    initial={{ width: "0%" }}
                    animate={{ width: paused ? "100%" : "100%" }}
                    transition={{ duration: paused ? 0.3 : DURATION / 1000, ease: "linear" }}
                  />
                ) : k < i ? (
                  <span className="absolute inset-0 bg-ink/40" />
                ) : null}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => go(-1)} aria-label="Previous" className="grid h-12 w-12 place-items-center rounded-full border border-ink/15 transition hover:bg-ink hover:text-paper">
              <ArrowLeft size={18} />
            </button>
            <button onClick={() => go(1)} aria-label="Next" className="grid h-12 w-12 place-items-center rounded-full bg-ink text-paper transition hover:bg-accent">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
