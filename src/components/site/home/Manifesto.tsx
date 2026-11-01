"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useSite } from "../providers";
import { ScrubText, SectionLabel } from "../motion";

export default function Manifesto({ images }: { images: string[] }) {
  const s = useSite();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [120, -160]);
  const y2 = useTransform(scrollYProgress, [0, 1], [200, -260]);
  const y3 = useTransform(scrollYProgress, [0, 1], [60, -120]);
  const r1 = useTransform(scrollYProgress, [0, 1], [-8, 6]);
  const r2 = useTransform(scrollYProgress, [0, 1], [6, -8]);
  const items = s.hero.marquee.length ? s.hero.marquee : [s.brand.tagline];

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* marquee */}
      <div className="marquee-paused overflow-hidden border-y border-line py-5">
        <div className="marquee flex w-max gap-10 whitespace-nowrap">
          {[...items, ...items, ...items, ...items].map((m, i) => (
            <span key={i} className="display flex items-center gap-10 text-4xl sm:text-6xl">
              <span className={i % 2 ? "italic text-accent" : ""}>{m}</span>
              <span className="text-2xl text-accent">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 py-28 sm:px-10 sm:py-44">
        <SectionLabel index="01" className="mb-10 text-muted">
          Manifesto
        </SectionLabel>
        <ScrubText text={s.manifesto} className="display relative z-10 max-w-[18ch] text-[11vw] leading-[1] sm:text-[7vw] lg:text-[5.6vw]" />

        {images[0] && (
          <motion.img style={{ y: y1, rotate: r1 }} src={images[0]} alt="" className="absolute right-[6%] top-[12%] hidden w-[17vw] max-w-[260px] rounded-[20px] object-cover shadow-2xl aspect-[3/4] md:block" />
        )}
        {images[1] && (
          <motion.img style={{ y: y2, rotate: r2 }} src={images[1]} alt="" className="absolute bottom-[4%] right-[24%] w-[34vw] max-w-[200px] rounded-[20px] object-cover shadow-2xl aspect-square md:w-[13vw]" />
        )}
        {images[2] && (
          <motion.img style={{ y: y3 }} src={images[2]} alt="" className="absolute right-[3%] top-[58%] hidden w-[12vw] max-w-[180px] rounded-full object-cover shadow-2xl aspect-square lg:block" />
        )}
      </div>
    </section>
  );
}
