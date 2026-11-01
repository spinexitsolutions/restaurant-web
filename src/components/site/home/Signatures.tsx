"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { money } from "@/lib/format";
import { useSite } from "../providers";
import { RevealText, SectionLabel } from "../motion";
import AddButton, { TAG_LABEL, VegMark } from "./AddButton";

export default function Signatures({ items }: { items: MenuItem[] }) {
  const s = useSite();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items.length]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const xRaw = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const x = useSpring(xRaw, { stiffness: 140, damping: 30, mass: 0.3 });
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={section} className="relative bg-ink text-paper" style={{ height: `calc(100dvh + ${dist}px)` }}>
      <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden">
        <motion.div ref={track} style={{ x }} className="flex w-max items-stretch gap-5 px-5 sm:gap-7 sm:px-10">
          {/* intro card */}
          <div className="flex w-[82vw] shrink-0 flex-col justify-between py-4 sm:w-[46vw] lg:w-[34vw]">
            <SectionLabel index="02" className="text-paper/50">
              Signatures
            </SectionLabel>
            <div>
              <RevealText as="h2" text="The dishes we're known for." className="display block text-[14vw] sm:text-[8vw] lg:text-[6.2vw]" />
              <p className="mt-6 max-w-sm text-paper/60">Drag your eyes to the right — or just keep scrolling. Each one is a story we&apos;ve been telling for years.</p>
              <Link href="/menu" className="group mt-8 inline-flex items-center gap-2 border-b border-paper/30 pb-1 text-[15px] hover:border-accent">
                Full menu <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {items.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
              className="group relative flex w-[78vw] shrink-0 flex-col sm:w-[42vw] lg:w-[28vw]"
              data-cursor="Taste"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] bg-white/5">
                <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <span className="display absolute left-5 top-4 text-6xl text-paper/90">{String(i + 1).padStart(2, "0")}</span>
                <div className="absolute right-4 top-4 flex flex-wrap justify-end gap-1.5">
                  {item.tags.filter((t) => t !== "veg").slice(0, 2).map((t) => (
                    <span key={t} className="glass rounded-full px-2.5 py-1 text-[11px] text-paper">{TAG_LABEL[t]}</span>
                  ))}
                </div>
                <div className="absolute bottom-4 right-4">
                  <AddButton item={item} className="!bg-paper !text-ink hover:!bg-accent hover:!text-paper" />
                </div>
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="display flex items-center gap-2 text-3xl sm:text-4xl">
                    {item.name}
                  </h3>
                  <p className="mt-1 max-w-[34ch] text-[14px] text-paper/55">{item.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 pt-2">
                  <VegMark veg={item.tags.includes("veg")} />
                  <span className="font-mono text-[15px] tabular-nums">{money(item.price, s.ordering.currency)}</span>
                </div>
              </div>
            </motion.article>
          ))}
          <div className="w-[6vw] shrink-0" />
        </motion.div>

        <div className="absolute bottom-8 left-5 right-5 h-px bg-white/10 sm:left-10 sm:right-10">
          <motion.div style={{ width: bar }} className="h-full bg-accent" />
        </div>
      </div>
    </section>
  );
}
