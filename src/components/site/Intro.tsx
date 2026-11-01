"use client";

import { AnimatePresence, motion, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { useIntro, useSite } from "./providers";
import { EASE, EXPO } from "./motion";

import { INTRO_KEY as KEY } from "@/lib/intro";

export default function Intro({ images }: { images: string[] }) {
  const s = useSite();
  const { done, setDone } = useIntro();
  const cfg = s.intro;
  const [phase, setPhase] = useState<"run" | "exit" | "gone">("run");
  const [count, setCount] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    if (done) {
      setPhase("gone");
      return;
    }
    if (document.documentElement.classList.contains("intro-skip")) {
      setPhase("gone");
      setDone(true);
      return;
    }
    const total = Math.max(1200, cfg.durationMs);
    const ctrl = animate(0, 100, { duration: total / 1000, ease: [0.65, 0, 0.35, 1], onUpdate: (v) => setCount(Math.round(v)) });
    const words = cfg.words.length ? cfg.words : [s.brand.name];
    const per = total / words.length;
    const timers = words.map((_, i) => setTimeout(() => setWordIdx(i), i * per));
    const t1 = setTimeout(() => {
      setPhase("exit");
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
    }, total + 250);
    const t2 = setTimeout(() => setDone(true), total + 750);
    const t3 = setTimeout(() => setPhase("gone"), total + 1800);
    return () => {
      ctrl.stop();
      timers.forEach(clearTimeout);
      [t1, t2, t3].forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "gone") return null;
  const words = cfg.words.length ? cfg.words : [s.brand.name];
  const exiting = phase === "exit";

  return (
    <div data-intro className="fixed inset-0 z-[100] pointer-events-auto" aria-hidden>
      {cfg.style === "curtain" && <Curtain words={words} idx={wordIdx} count={count} exiting={exiting} brand={s.brand.name} />}
      {cfg.style === "counter" && <CounterIntro images={images} count={count} exiting={exiting} brand={s.brand.name} tagline={s.brand.tagline} />}
      {cfg.style === "words" && <WordsIntro words={words} idx={wordIdx} exiting={exiting} />}
    </div>
  );
}

/* ── Style 1: Curtain — words cycle, then the ink splits into columns that rise away ── */
function Curtain({ words, idx, count, exiting, brand }: { words: string[]; idx: number; count: number; exiting: boolean; brand: string }) {
  const cols = 5;
  return (
    <>
      <div className="absolute inset-0 flex">
        {Array.from({ length: cols }).map((_, i) => (
          <motion.div
            key={i}
            className="h-full flex-1 bg-ink -mx-px"
            initial={{ y: 0 }}
            animate={exiting ? { y: "-102%" } : { y: 0 }}
            transition={{ duration: 1.1, ease: EXPO, delay: exiting ? i * 0.07 : 0 }}
          />
        ))}
      </div>
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-paper"
        animate={exiting ? { opacity: 0, y: -40 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="relative h-[22vw] max-h-48 min-h-24 w-full overflow-hidden text-center">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={idx}
              className="display absolute inset-x-0 top-0 block text-[22vw] leading-none sm:text-[15vw] md:text-[11rem]"
              initial={{ y: "100%", opacity: 0, filter: "blur(8px)" }}
              animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
              exit={{ y: "-100%", opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              {idx === words.length - 1 ? <em className="text-accent-soft">{words[idx]}</em> : words[idx]}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>
      <motion.div
        className="absolute inset-x-5 bottom-6 flex items-end justify-between text-paper/70 sm:inset-x-10 sm:bottom-10"
        animate={exiting ? { opacity: 0 } : { opacity: 1 }}
      >
        <div className="eyebrow">{brand} — Est. 1986</div>
        <div className="font-mono text-5xl tabular-nums text-paper sm:text-7xl">{String(count).padStart(3, "0")}</div>
      </motion.div>
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-accent"
        style={{ width: `${count}%` }}
        animate={exiting ? { opacity: 0 } : { opacity: 1 }}
      />
    </>
  );
}

/* ── Style 2: Counter — a flipbook of dishes in a frame that expands to fill the screen ── */
function CounterIntro({ images, count, exiting, brand, tagline }: { images: string[]; count: number; exiting: boolean; brand: string; tagline: string }) {
  const img = images[Math.min(images.length - 1, Math.floor((count / 101) * images.length))] || images[0];
  return (
    <motion.div
      className="absolute inset-0 bg-paper"
      animate={exiting ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE, delay: exiting ? 0.55 : 0 }}
    >
      <motion.div
        className="absolute left-1/2 top-1/2 overflow-hidden rounded-[18px] bg-ink"
        initial={{ width: 0, height: 0, x: "-50%", y: "-50%" }}
        animate={
          exiting
            ? { width: "100vw", height: "100dvh", borderRadius: 0, x: "-50%", y: "-50%" }
            : { width: "min(42vw, 260px)", height: "min(56vw, 340px)", x: "-50%", y: "-50%" }
        }
        transition={{ duration: exiting ? 1 : 0.9, ease: exiting ? EXPO : EASE }}
      >
        {img && <img src={img} alt="" className="h-full w-full object-cover" />}
      </motion.div>
      <motion.div animate={exiting ? { opacity: 0 } : { opacity: 1 }} className="absolute inset-x-5 top-6 flex justify-between sm:inset-x-10 sm:top-10">
        <span className="display text-3xl">{brand}</span>
        <span className="eyebrow self-center text-muted">{tagline}</span>
      </motion.div>
      <motion.div
        animate={exiting ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
        className="display absolute bottom-2 left-4 text-[34vw] leading-[0.8] tabular-nums sm:left-8 sm:text-[22vw]"
      >
        {count}
        <span className="text-accent">%</span>
      </motion.div>
    </motion.div>
  );
}

/* ── Style 3: Words — calm, blurred word sequence on paper, then a wipe ── */
function WordsIntro({ words, idx, exiting }: { words: string[]; idx: number; exiting: boolean }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-paper"
      initial={{ clipPath: "inset(0 0 0% 0)" }}
      animate={exiting ? { clipPath: "inset(0 0 100% 0)" } : { clipPath: "inset(0 0 0% 0)" }}
      transition={{ duration: 1, ease: EXPO }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          className="display text-[18vw] sm:text-[9rem]"
          initial={{ opacity: 0, filter: "blur(20px)", scale: 0.92 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)", scale: 1.06 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {idx === words.length - 1 ? <em className="text-accent">{words[idx]}</em> : words[idx]}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}
