"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import clsx from "clsx";
import type { MenuItem } from "@/lib/types";
import { money, openStatus } from "@/lib/format";
import { useIntro, useSite } from "../providers";
import { EASE, Magnetic } from "../motion";
import AddButton from "./AddButton";

/**
 * Hero — "The Plate".
 * A giant condensed headline with a live, rotating plate set into the type.
 * On scroll the words slide apart and the plate opens into a full-screen
 * circular portal that reveals the dining room.
 */
export default function Hero({ dishes }: { dishes: MenuItem[] }) {
  const s = useSite();
  const h = s.hero;
  const { done } = useIntro();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const plateA = useRef<HTMLDivElement>(null);
  const plateB = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState({ cx: 0, cy: 0, r1: 1600 });
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);
  const dish = dishes[idx % Math.max(1, dishes.length)];

  useEffect(() => setStatus(openStatus(s.hours)), [s.hours]);

  // rotate through signature dishes
  useEffect(() => {
    if (dishes.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % dishes.length), 3200);
    return () => clearInterval(t);
  }, [dishes.length]);

  // portal origin = centre of whichever plate is visible
  useEffect(() => {
    const measure = () => {
      const plate = [plateA.current, plateB.current].find((p) => p && p.offsetParent !== null);
      if (!plate || !stage.current) return;
      const pr = plate.getBoundingClientRect();
      const sr = stage.current.getBoundingClientRect();
      const cx = pr.left + pr.width / 2 - sr.left;
      const cy = pr.top + pr.height / 2 - sr.top;
      const r1 = Math.hypot(Math.max(cx, sr.width - cx), Math.max(cy, sr.height - cy)) + 40;
      setGeo({ cx, cy, r1 });
    };
    measure();
    const t = setTimeout(measure, 1200);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [done]);

  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start start", "end end"] });
  const r = useTransform(p, [0.04, 0.62], [0, geo.r1]);
  const clip = useMotionTemplate`circle(${r}px at ${geo.cx}px ${geo.cy}px)`;
  const leftX = useTransform(p, [0, 0.6], ["0vw", "-40vw"]);
  const rightX = useTransform(p, [0, 0.6], ["0vw", "40vw"]);
  const imgScale = useTransform(p, [0.04, 0.8], [1.5, 1]);
  const uiOpacity = useTransform(p, [0, 0.2], [1, 0]);
  const uiY = useTransform(p, [0, 0.25], [0, 60]);
  const overlayO = useTransform(p, [0.5, 0.75], [0, 1]);
  const overlayY = useTransform(p, [0.5, 0.85], [80, 0]);

  const words1 = h.title.split(" ");
  const words2 = h.titleAccent.split(" ");

  const letters = (text: string, base: number) =>
    Array.from(text).map((ch, i) => (
      <motion.span
        key={i}
        className="inline-block"
        initial={{ y: "115%", rotate: 8 }}
        animate={done ? { y: "0%", rotate: 0 } : {}}
        transition={{ duration: 1.05, ease: EASE, delay: base + i * 0.035 }}
      >
        {ch === " " ? " " : ch}
      </motion.span>
    ));

  return (
    <section ref={section} className="relative h-[190vh]">
      <div ref={stage} className="sticky top-0 flex h-dvh flex-col overflow-hidden">
        {/* meta row */}
        <motion.div
          style={{ opacity: uiOpacity }}
          initial={{ opacity: 0 }}
          animate={done ? { opacity: 1 } : {}}
          className="flex items-center justify-between px-5 pt-[96px] sm:px-10 sm:pt-[104px]"
        >
          <span className="eyebrow flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            {h.eyebrow}
          </span>
          <span className="eyebrow hidden text-muted md:block">Since 1986 — No. 14 Carter Rd</span>
        </motion.div>

        {/* headline */}
        <div className="relative flex flex-1 flex-col justify-center px-4 sm:px-8">
          <h1 className="mega select-none text-[21vw] sm:text-[15vw] lg:text-[14.2vw] 2xl:text-[13vw]" aria-label={`${h.title} ${h.titleAccent}`}>
            <span className="flex items-center gap-[0.12em]">
              <motion.span style={{ x: leftX }} className="flex gap-[0.18em] overflow-hidden pb-[0.04em]">
                {words1.map((w, i) => (
                  <span key={i}>{letters(w, 0.1 + i * 0.15)}</span>
                ))}
              </motion.span>
              <Plate refEl={plateA} dish={dish} done={done} inline className="hidden md:block" />
              <motion.span
                style={{ opacity: uiOpacity }}
                initial={{ opacity: 0 }}
                animate={done ? { opacity: 1 } : {}}
                transition={{ delay: 1 }}
                className="ml-auto hidden max-w-[17rem] self-end pb-[0.06em] font-sans text-[15px] font-normal normal-case leading-snug tracking-normal [word-spacing:normal] [font-stretch:100%] text-muted lg:block"
              >
                {h.subtitle}
              </motion.span>
            </span>
            <motion.span style={{ x: rightX }} className="flex flex-wrap justify-end gap-x-[0.18em] overflow-hidden pb-[0.04em] text-accent">
              {words2.map((w, i) => (
                <span key={i}>{letters(w, 0.35 + i * 0.15)}</span>
              ))}
            </motion.span>
          </h1>
          {/* mobile plate */}
          <div className="mt-6 flex items-center gap-5 md:hidden">
            <Plate refEl={plateB} dish={dish} done={done} className="ml-3 h-24 w-24" />
            <p className="text-[14.5px] leading-snug text-muted">{h.subtitle}</p>
          </div>
        </div>

        {/* bento bar */}
        <motion.div
          style={{ opacity: uiOpacity, y: uiY }}
          initial={{ opacity: 0, y: 40 }}
          animate={done ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: EASE, delay: 0.7 }}
          className="-mx-0 flex snap-x gap-2 overflow-x-auto px-3 pb-3 no-scrollbar sm:grid sm:grid-cols-4 sm:gap-3 sm:px-8 sm:pb-6"
        >
          <Link
            href="/reserve"
            className="group relative flex min-w-[72%] snap-start flex-col justify-between overflow-hidden rounded-[22px] bg-accent p-4 text-paper sm:min-w-0 sm:p-5"
          >
            <span className="eyebrow opacity-70">Reservations</span>
            <span className="mt-6 flex items-end justify-between">
              <span className="text-[22px] font-semibold leading-tight tracking-tight sm:text-[26px]">{h.ctaPrimary}</span>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-paper text-accent transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight size={18} />
              </span>
            </span>
            <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 transition-transform duration-700 group-hover:scale-[2.5]" />
          </Link>

          <div className="flex min-w-[78%] snap-start items-center gap-3 rounded-[22px] bg-ink p-3 text-paper sm:min-w-0">
            <div className="relative h-full min-h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[16px]">
              <AnimatePresence mode="popLayout">
                {dish && (
                  <motion.img
                    key={dish.id}
                    src={dish.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={{ opacity: 0, scale: 1.3 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                )}
              </AnimatePresence>
            </div>
            <div className="min-w-0 flex-1">
              <span className="eyebrow text-paper/50">On the plate</span>
              <AnimatePresence mode="wait">
                {dish && (
                  <motion.div key={dish.id} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.35 }}>
                    <div className="truncate text-[16px] font-semibold">{dish.name}</div>
                    <div className="text-[13px] tabular-nums text-paper/60">{money(dish.price, s.ordering.currency)}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {dish && <AddButton item={dish} className="!bg-paper !text-ink hover:!bg-accent-soft" />}
          </div>

          <Link href="/contact" className="flex min-w-[60%] snap-start flex-col justify-between rounded-[22px] bg-cream p-4 ring-1 ring-ink/5 sm:min-w-0 sm:p-5">
            <span className="flex items-center gap-2 text-[13px] font-medium">
              <span className={clsx("pulse-dot h-2 w-2 rounded-full", status?.open ? "bg-emerald-500 text-emerald-500" : "bg-ink/30 text-ink/30")} />
              {status ? (status.open ? "Open now" : "Closed now") : " "}
            </span>
            <span className="mt-4">
              <span className="block text-[20px] font-semibold tracking-tight">{status?.label || " "}</span>
              <span className="text-[13px] text-muted">{s.contact.address}</span>
            </span>
          </Link>

          <div className="flex min-w-[56%] snap-start flex-col justify-between rounded-[22px] bg-accent-soft p-4 sm:min-w-0 sm:p-5">
            <span className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </span>
            <span className="mt-4">
              <span className="block text-[28px] font-bold leading-none tracking-tight">4.9 / 5</span>
              <span className="text-[13px] opacity-70">from {(s.stats[2]?.value || 2400).toLocaleString("en-IN")}+ guests every week</span>
            </span>
          </div>
        </motion.div>

        {/* circular portal */}
        <motion.div style={{ clipPath: clip }} className="pointer-events-none absolute inset-0 z-20 bg-ink">
          <motion.img src={h.image} alt="" style={{ scale: imgScale }} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/30" />
          <motion.div style={{ opacity: overlayO, y: overlayY }} className="pointer-events-auto absolute inset-x-0 bottom-0 px-5 pb-24 text-paper sm:px-10 sm:pb-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="mega max-w-4xl text-[16vw] sm:text-[10vw] lg:text-[7.5vw]">
                {s.brand.tagline.split(" ").slice(0, -1).join(" ")} <span className="text-accent-soft">{s.brand.tagline.split(" ").slice(-1)}</span>
              </h2>
              <div className="flex flex-wrap gap-3">
                <Magnetic>
                  <Link href="/reserve" className="flex h-14 items-center gap-2 rounded-full bg-accent px-7 font-semibold text-paper active:scale-95">
                    {h.ctaPrimary} <ArrowUpRight size={18} />
                  </Link>
                </Magnetic>
                <Magnetic>
                  <Link href="/menu" className="flex h-14 items-center gap-2 rounded-full bg-paper px-7 font-semibold text-ink active:scale-95">
                    {h.ctaSecondary}
                  </Link>
                </Magnetic>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/** A rotating plate with an orbiting text ring. Dishes swap with a spin. */
function Plate({ dish, done, refEl, className, inline }: { dish?: MenuItem; done: boolean; refEl: React.RefObject<HTMLDivElement | null>; className?: string; inline?: boolean }) {
  return (
    <motion.div
      ref={refEl}
      className={clsx("relative shrink-0", className)}
      style={inline ? { width: "0.95em", height: "0.95em" } : undefined}
      initial={{ scale: 0, rotate: -120 }}
      animate={done ? { scale: 1, rotate: 0 } : {}}
      transition={{ duration: 1.4, ease: EASE, delay: 0.45 }}
    >
      <div className="relative h-full w-full">
        {/* text ring */}
        <svg viewBox="0 0 200 200" className="spin-rev absolute -inset-[14%] h-[128%] w-[128%] text-ink" aria-hidden>
          <defs>
            <path id="ring" d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0" />
          </defs>
          <text fontSize="12.5" fontWeight="600" letterSpacing="3.2" fill="currentColor" style={{ fontFamily: "var(--font-sans)", textTransform: "uppercase" }}>
            <textPath href="#ring">Wood-fired • Since 1986 • Bandra • Noor • Wood-fired • Since 1986 •</textPath>
          </text>
        </svg>
        <div className="absolute inset-[6%] overflow-hidden rounded-full bg-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] ring-[3px] ring-paper">
          <div className="spin-slow absolute inset-0">
          <AnimatePresence mode="popLayout" initial={false}>
            {dish && (
              <motion.img
                key={dish.id}
                src={dish.image}
                alt={dish.name}
                className="absolute inset-0 h-full w-full object-cover"
                initial={{ opacity: 0, scale: 1.4, rotate: -60 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.9, ease: EASE }}
              />
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
