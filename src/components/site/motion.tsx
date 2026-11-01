"use client";

import { motion, useInView, useScroll, useTransform, useSpring, animate, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";
import clsx from "clsx";

export const EASE = [0.22, 1, 0.36, 1] as const;
export const EXPO = [0.87, 0, 0.13, 1] as const;

/** Word-by-word masked reveal. Each word slides up from behind a clip. */
export function RevealText({
  text,
  as: Tag = "span",
  className,
  delay = 0,
  stagger = 0.06,
  once = true,
  italicWords = [],
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  italicWords?: string[];
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, margin: "0px 0px -10% 0px" });
  const words = text.split(" ");
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
          <motion.span
            className={clsx("inline-block will-change-transform", italicWords.includes(w) && "text-accent")}
            initial={{ y: "110%", rotate: 4 }}
            animate={inView ? { y: "0%", rotate: 0 } : { y: "110%", rotate: 4 }}
            transition={{ duration: 1, ease: EASE, delay: delay + i * stagger }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

export function FadeUp({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "article" | "p" | "span";
}) {
  const M = motion[as] as typeof motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

/** Image that reveals with a clip-path wipe and drifts on scroll. */
export function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  strength = 12,
  reveal = true,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  strength?: number;
  reveal?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  return (
    <motion.div
      ref={ref}
      className={clsx("relative overflow-hidden", className)}
      initial={reveal ? { clipPath: "inset(18% 10% 18% 10% round 28px)" } : false}
      animate={inView ? { clipPath: "inset(0% 0% 0% 0% round 0px)" } : undefined}
      transition={{ duration: 1.4, ease: EASE }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ y, scale: 1 + strength / 50 }}
        className={clsx("absolute inset-0 h-full w-full object-cover", imgClassName)}
      />
    </motion.div>
  );
}

export function Counter({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, { duration: 2.2, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, value]);
  return (
    <span ref={ref} className={className}>
      {n.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/** Button that is gently pulled toward the cursor (desktop only). */
export function Magnetic({ children, className, strength = 0.35 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <motion.div
      ref={ref}
      className={clsx("inline-block", className)}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setPos({ x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength });
      }}
      onPointerLeave={() => setPos({ x: 0, y: 0 })}
      animate={pos}
      transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

/** Scroll-scrubbed word highlighting (Apple product-page style). */
export function ScrubText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <ScrubWord key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </ScrubWord>
      ))}
    </p>
  );
}

function ScrubWord({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const blur = useTransform(progress, range, [4, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  return (
    <motion.span style={{ opacity, filter }} className="inline-block mr-[0.25em]">
      {children}
    </motion.span>
  );
}

export function useSmoothProgress(v: MotionValue<number>) {
  return useSpring(v, { stiffness: 120, damping: 30, mass: 0.3 });
}

/** Section tag: a pill with a live dot and an index counter — replaces the usual "01 —— LABEL". */
export function SectionLabel({ index, children, className }: { index?: string; children: ReactNode; className?: string }) {
  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <motion.span
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="h-2.5 w-2.5 rounded-full bg-accent"
      />
      <span className="eyebrow rounded-full border border-current/20 px-3 py-1.5">{children}</span>
      {index && <span className="eyebrow opacity-50">/{index}</span>}
    </div>
  );
}
