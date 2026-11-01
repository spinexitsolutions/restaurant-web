"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import { useRef } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useIntro, useSite } from "../providers";
import { EASE, Magnetic } from "../motion";

export default function Hero() {
  const s = useSite();
  const h = s.hero;
  const { done } = useIntro();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // image grows from a card into a full-bleed frame
  const top = useTransform(scrollYProgress, [0, 0.55], [56, 0]);
  const side = useTransform(scrollYProgress, [0, 0.55], [4, 0]);
  const bottom = useTransform(scrollYProgress, [0, 0.55], [3, 0]);
  const radius = useTransform(scrollYProgress, [0, 0.55], [28, 0]);
  const clip = useMotionTemplate`inset(${top}% ${side}% ${bottom}% ${side}% round ${radius}px)`;
  const imgScale = useTransform(scrollYProgress, [0, 0.7], [1.3, 1]);
  const headY = useTransform(scrollYProgress, [0, 0.45], ["0%", "-35%"]);
  const headOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0.45, 0.7], [0, 1]);
  const overlayY = useTransform(scrollYProgress, [0.45, 0.8], [60, 0]);

  const lines = [h.title, h.titleAccent];

  return (
    <section ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 h-dvh overflow-hidden">
        {/* Headline */}
        <motion.div style={{ y: headY, opacity: headOpacity }} className="absolute inset-x-0 top-0 z-10 px-5 pt-[118px] sm:px-10 sm:pt-[132px]">
          <motion.div
            className="eyebrow mb-5 flex items-center gap-3 text-muted"
            initial={{ opacity: 0, y: 10 }}
            animate={done ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {h.eyebrow}
          </motion.div>
          <div className="flex items-end justify-between gap-10">
            <h1 className="display text-[15.5vw] sm:text-[11vw] lg:text-[8.6vw] 2xl:text-[10rem]">
              {lines.map((line, li) => (
                <span key={li} className="block overflow-hidden pb-[0.06em]">
                  <motion.span
                    className={li === 1 ? "block italic text-accent" : "block"}
                    initial={{ y: "105%" }}
                    animate={done ? { y: "0%" } : {}}
                    transition={{ duration: 1.2, ease: EASE, delay: 0.15 + li * 0.12 }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p
              className="mb-4 hidden max-w-[22rem] text-[16px] leading-relaxed text-muted text-pretty lg:block"
              initial={{ opacity: 0, y: 16 }}
              animate={done ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: EASE, delay: 0.5 }}
            >
              {h.subtitle}
            </motion.p>
          </div>
        </motion.div>

        {/* Expanding image */}
        <motion.div
          style={{ clipPath: clip }}
          initial={{ opacity: 0 }}
          animate={done ? { opacity: 1 } : {}}
          transition={{ duration: 1.2, ease: EASE, delay: 0.35 }}
          className="absolute inset-0 bg-ink"
          data-cursor="Scroll"
        >
          <motion.img src={h.image} alt="" style={{ scale: imgScale }} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/30" />

          {/* text once full-bleed */}
          <motion.div style={{ opacity: overlayOpacity, y: overlayY }} className="absolute inset-x-0 bottom-0 px-5 pb-24 text-paper sm:px-10 sm:pb-14">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <h2 className="display max-w-3xl text-[13vw] leading-[0.9] sm:text-7xl lg:text-8xl">
                {s.brand.tagline.split(" ").slice(0, -1).join(" ")} <em className="text-accent-soft">{s.brand.tagline.split(" ").slice(-1)}</em>
              </h2>
              <div className="flex flex-wrap gap-3">
                <Magnetic>
                  <Link href="/reserve" className="flex h-14 items-center gap-2 rounded-full bg-paper px-7 font-medium text-ink transition-transform active:scale-95">
                    {h.ctaPrimary} <ArrowUpRight size={18} />
                  </Link>
                </Magnetic>
                <Magnetic>
                  <Link href="/menu" className="glass flex h-14 items-center gap-2 rounded-full px-7 font-medium text-paper ring-1 ring-white/20 active:scale-95">
                    {h.ctaSecondary}
                  </Link>
                </Magnetic>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll cue on card */}
        <motion.div
          style={{ opacity: headOpacity }}
          className="pointer-events-none absolute bottom-[7%] right-[8%] z-10 hidden items-center gap-3 text-paper sm:flex"
          initial={{ opacity: 0 }}
          animate={done ? { opacity: 1 } : {}}
        >
          <span className="eyebrow">Scroll</span>
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }} className="grid h-10 w-10 place-items-center rounded-full border border-white/40">
            <ArrowDown size={16} />
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
