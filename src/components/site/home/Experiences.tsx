"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, CalendarDays, Users } from "lucide-react";
import type { EventItem } from "@/lib/types";
import { fmtDate, money, to12h } from "@/lib/format";
import { useSite } from "../providers";
import { RevealText, SectionLabel } from "../motion";
import Btn from "../Button";

/** Stacking cards: each event pins and gently scales back as the next arrives. */
export default function Experiences({ events }: { events: EventItem[] }) {
  return (
    <section className="relative bg-ink pb-24 text-paper sm:pb-32">
      <div className="mx-auto max-w-[1400px] px-5 pt-28 sm:px-10 sm:pt-36">
        <SectionLabel index="05" className="mb-8 text-paper/50">
          Experiences
        </SectionLabel>
        <div className="mb-16 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <RevealText as="h2" text="Evenings worth planning around." className="display block max-w-[14ch] text-[38px] sm:text-[56px] lg:text-[64px]" />
          <Link href="/events" className="group flex items-center gap-2 text-paper/70 hover:text-paper">
            All experiences <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
          </Link>
        </div>
        <div className="relative">
          {events.map((e, i) => (
            <Card key={e.id} e={e} i={i} total={events.length} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Card({ e, i, total }: { e: EventItem; i: number; total: number }) {
  const s = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1 - (total - i) * 0.04]);
  const dim = useTransform(scrollYProgress, [0, 1], [0, 0.5]);
  return (
    <div ref={ref} className="sticky h-[78vh] min-h-[540px] pb-6" style={{ top: `calc(90px + ${i * 22}px)` }}>
      <motion.article style={{ scale }} className="relative h-full origin-top overflow-hidden rounded-[30px] bg-[#1e1b18] ring-1 ring-white/10" data-cursor="Book">
        <div className="flex h-full flex-col md:grid md:grid-cols-2">
          <div className="relative h-[42%] shrink-0 overflow-hidden md:h-full">
            <img src={e.image} alt={e.title} loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-1 flex-col justify-between gap-4 p-6 sm:p-10">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[12px] text-paper/50">{String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
              <span className="rounded-full bg-accent/90 px-3 py-1 text-[12px]">{e.seats} seats</span>
            </div>
            <div>
              <h3 className="display text-[34px] leading-[1.05] sm:text-5xl lg:text-[56px]">{e.title}</h3>
              <p className="mt-3 line-clamp-3 max-w-md text-[15px] text-paper/60 text-pretty sm:mt-4 sm:line-clamp-none sm:text-base">{e.description}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-[14px] text-paper/70">
                <span className="flex items-center gap-2"><CalendarDays size={15} /> {fmtDate(e.date, { weekday: "short", day: "numeric", month: "short" })} · {to12h(e.time)}</span>
                <span className="flex items-center gap-2"><Users size={15} /> {money(e.price, s.ordering.currency)} pp</span>
              </div>
              <Btn href={`/reserve?occasion=${encodeURIComponent(e.title)}&date=${e.date}&time=${e.time}`} variant="light" size="sm">Book seats</Btn>
            </div>
          </div>
        </div>
        <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-black" />
      </motion.article>
    </div>
  );
}
