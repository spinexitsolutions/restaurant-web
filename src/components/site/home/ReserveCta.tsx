"use client";

import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { useSite } from "../providers";
import { RevealText, SectionLabel } from "../motion";
import { to12h } from "@/lib/format";
import { IMG } from "@/lib/seed";

export default function ReserveCta() {
  const s = useSite();
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(s.reservations.slots[4] || s.reservations.slots[0] || "20:00");
  const [guests, setGuests] = useState(2);

  return (
    <section ref={ref} className="relative overflow-hidden bg-ink text-paper">
      <motion.img style={{ scale }} src={IMG.diningRoom} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink" />
      <div className="relative mx-auto max-w-[1400px] px-5 py-32 sm:px-10 sm:py-44">
        <SectionLabel index="10" className="mb-8 text-paper/60">
          Reservations
        </SectionLabel>
        <RevealText as="h2" text="Your table is waiting." className="display block max-w-[14ch] text-[44px] sm:text-[64px] lg:text-[80px]" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/reserve?date=${date}&time=${time}&guests=${guests}`);
          }}
          className="glass mt-14 grid gap-2 rounded-[28px] p-2 ring-1 ring-white/15 sm:grid-cols-[1fr_1fr_1fr_auto] sm:rounded-full"
        >
          <label className="flex flex-col justify-center rounded-[22px] px-5 py-3 transition hover:bg-white/5 sm:rounded-full">
            <span className="eyebrow text-paper/50">Date</span>
            <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent text-[16px] outline-none [color-scheme:dark]" />
          </label>
          <label className="flex flex-col justify-center rounded-[22px] px-5 py-3 transition hover:bg-white/5 sm:rounded-full">
            <span className="eyebrow text-paper/50">Time</span>
            <select value={time} onChange={(e) => setTime(e.target.value)} className="bg-transparent text-[16px] outline-none [color-scheme:dark]">
              {s.reservations.slots.map((t) => (
                <option key={t} value={t}>{to12h(t)}</option>
              ))}
            </select>
          </label>
          <div className="flex items-center justify-between rounded-[22px] px-5 py-3 sm:rounded-full">
            <span className="flex flex-col">
              <span className="eyebrow text-paper/50">Guests</span>
              <span className="text-[16px] tabular-nums">{guests} {guests === 1 ? "person" : "people"}</span>
            </span>
            <span className="flex gap-1">
              <button type="button" aria-label="Fewer guests" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"><Minus size={14} /></button>
              <button type="button" aria-label="More guests" onClick={() => setGuests((g) => Math.min(s.reservations.maxGuests, g + 1))} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"><Plus size={14} /></button>
            </span>
          </div>
          <button className="flex h-16 items-center justify-center gap-2 rounded-[22px] bg-accent px-8 font-medium sm:rounded-full">
            Find a table <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </section>
  );
}
