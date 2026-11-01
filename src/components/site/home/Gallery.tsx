"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import type { GalleryImage } from "@/lib/types";
import { RevealText, SectionLabel } from "../motion";

export default function Gallery({ images }: { images: GalleryImage[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-60, 180]);
  const y3 = useTransform(scrollYProgress, [0, 1], [40, -320]);
  const cols: GalleryImage[][] = [[], [], []];
  images.forEach((img, i) => cols[i % 3].push(img));

  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      <div className="mx-auto mb-16 flex max-w-[1400px] flex-col justify-between gap-6 px-5 sm:px-10 lg:flex-row lg:items-end">
        <div>
          <SectionLabel index="06" className="mb-8 text-muted">
            Gallery
          </SectionLabel>
          <RevealText as="h2" text="A room that glows." className="display block text-[38px] sm:text-[56px] lg:text-[64px]" />
        </div>
        <Link href="/gallery" className="group flex items-center gap-2 text-muted hover:text-ink">
          View the gallery <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
        </Link>
      </div>
      <div ref={ref} className="mx-auto grid h-[110vh] max-w-[1600px] grid-cols-2 gap-3 overflow-hidden px-3 sm:gap-5 sm:px-5 md:grid-cols-3">
        <Column imgs={cols[0]} y={y1} />
        <Column imgs={cols[1]} y={y2} className="mt-[-30%]" />
        <Column imgs={cols[2]} y={y3} className="hidden md:flex" />
      </div>
    </section>
  );
}

function Column({ imgs, y, className = "" }: { imgs: GalleryImage[]; y: MotionValue<number>; className?: string }) {
  return (
    <motion.div style={{ y }} className={`flex flex-col gap-3 sm:gap-5 ${className}`}>
      {[...imgs, ...imgs].map((g, i) => (
        <figure key={g.id + i} className="group relative overflow-hidden rounded-[22px]" data-cursor="View">
          <img src={g.image} alt={g.caption} loading="lazy" className={`w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105 ${g.span === "tall" ? "aspect-[3/4]" : g.span === "wide" ? "aspect-[4/3]" : "aspect-square"}`} />
          <figcaption className="glass absolute bottom-3 left-3 translate-y-2 rounded-full px-3 py-1 text-[12px] text-paper opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            {g.caption}
          </figcaption>
        </figure>
      ))}
    </motion.div>
  );
}
