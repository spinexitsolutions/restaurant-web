"use client";

import Link from "next/link";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { openStatus } from "@/lib/format";
import { useIntro, useSite } from "../providers";
import { EASE } from "../motion";

/**
 * Apple-style hero: a calm, centred headline with a large rounded photo
 * underneath. As you scroll, the photo grows edge-to-edge and the copy
 * gently fades away.
 */
export default function Hero() {
  const s = useSite();
  const h = s.hero;
  const { done } = useIntro();
  const section = useRef<HTMLElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const [startTop, setStartTop] = useState(58);
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);

  useEffect(() => setStatus(openStatus(s.hours)), [s.hours]);

  // the photo starts right under the copy, whatever the screen size
  useEffect(() => {
    const measure = () => {
      if (!head.current) return;
      const b = head.current.offsetTop + head.current.offsetHeight;
      setStartTop(Math.min(70, Math.max(34, ((b + 36) / window.innerHeight) * 100)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start start", "end end"] });
  const top = useTransform(p, [0, 0.6], [startTop, 0]);
  const side = useTransform(p, [0, 0.6], [6, 0]);
  const bottom = useTransform(p, [0, 0.6], [4, 0]);
  const radius = useTransform(p, [0, 0.6], [32, 0]);
  const clip = useMotionTemplate`inset(${top}% ${side}% ${bottom}% ${side}% round ${radius}px)`;
  const imgScale = useTransform(p, [0, 0.8], [1.18, 1]);
  const headOpacity = useTransform(p, [0, 0.3], [1, 0]);
  const headY = useTransform(p, [0, 0.4], [0, -60]);
  const headScale = useTransform(p, [0, 0.4], [1, 0.94]);
  const captionO = useTransform(p, [0.55, 0.75], [0, 1]);

  const fade = (d: number) => ({
    initial: { opacity: 0, y: 24, filter: "blur(8px)" },
    animate: done ? { opacity: 1, y: 0, filter: "blur(0px)" } : {},
    transition: { duration: 1.1, ease: EASE, delay: d },
  });

  return (
    <section ref={section} className="relative h-[210vh]">
      <div className="sticky top-0 h-dvh overflow-hidden">
        <motion.div
          ref={head}
          style={{ opacity: headOpacity, y: headY, scale: headScale }}
          className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pt-[112px] text-center sm:pt-[128px]"
        >
          <motion.p {...fade(0.05)} className="mb-4 text-[15px] font-semibold text-accent sm:text-[17px]">
            {h.eyebrow}
          </motion.p>
          <h1 className="display text-[44px] leading-[1.03] sm:text-[72px] lg:text-[88px]">
            <motion.span {...fade(0.15)} className="block">
              {h.title}
            </motion.span>
            <motion.span {...fade(0.28)} className="block text-muted">
              {h.titleAccent}
            </motion.span>
          </h1>
          <motion.p {...fade(0.42)} className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted sm:text-[19px]">
            {h.subtitle}
          </motion.p>
          <motion.div {...fade(0.55)} className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            <Link
              href="/reserve"
              className="flex h-12 items-center rounded-full bg-accent px-6 text-[15px] font-medium text-white transition hover:brightness-110 active:scale-[0.97]"
            >
              {h.ctaPrimary}
            </Link>
            <Link href="/menu" className="group flex items-center gap-0.5 text-[17px] text-accent">
              {h.ctaSecondary}
              <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </motion.div>

        {/* photo that grows to full-bleed */}
        <motion.div
          style={{ clipPath: clip }}
          initial={{ opacity: 0 }}
          animate={done ? { opacity: 1 } : {}}
          transition={{ duration: 1.4, ease: EASE, delay: 0.5 }}
          className="absolute inset-0 bg-mist"
        >
          <motion.img src={h.image} alt="" style={{ scale: imgScale }} className="h-full w-full object-cover" />
          <motion.div style={{ opacity: captionO }} className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-6 pb-24 pt-32 sm:px-12 sm:pb-12">
            <div className="mx-auto flex max-w-[1200px] flex-col gap-5 text-white sm:flex-row sm:items-end sm:justify-between">
              <p className="display max-w-2xl text-[34px] sm:text-[52px]">{s.brand.tagline}.</p>
              {status && (
                <span className="glass flex w-fit items-center gap-2 rounded-full px-4 py-2 text-[14px]">
                  <span className={`pulse-dot h-2 w-2 rounded-full ${status.open ? "bg-emerald-400 text-emerald-400" : "bg-white/50 text-white/50"}`} />
                  {s.contact.address.split(",").slice(-1)[0].trim()} · {status.label}
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
