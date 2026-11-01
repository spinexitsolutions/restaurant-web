"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { Offer } from "@/lib/types";
import { money } from "@/lib/format";
import { useSite } from "../providers";
import { EASE, SectionLabel } from "../motion";

export default function Offers({ offers }: { offers: Offer[] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-28 sm:px-10 sm:pb-36">
      <SectionLabel index="07" className="mb-10 text-muted">
        Offers
      </SectionLabel>
      <div className="grid gap-5 md:grid-cols-2">
        {offers.map((o, i) => (
          <Ticket key={o.id} o={o} i={i} />
        ))}
      </div>
    </section>
  );
}

function Ticket({ o, i }: { o: Offer; i: number }) {
  const s = useSite();
  const [copied, setCopied] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: i % 2 ? 2 : -2 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: EASE, delay: i * 0.1 }}
      className="relative flex overflow-hidden rounded-[26px] bg-accent text-paper"
    >
      <div className="relative w-2/5 shrink-0">
        <img src={o.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="relative flex flex-1 flex-col justify-between gap-6 border-l-2 border-dashed border-paper/40 p-6 sm:p-8">
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-paper" />
        <span className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-paper" />
        <div>
          <div className="display text-6xl leading-none sm:text-7xl">{o.discount}% off</div>
          <h3 className="mt-3 text-lg font-medium">{o.title}</h3>
          <p className="text-[14px] text-paper/75">{o.description} {o.minOrder > 0 && `Min. order ${money(o.minOrder, s.ordering.currency)}.`}</p>
        </div>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(o.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex w-fit items-center gap-3 rounded-full bg-paper/15 py-2 pl-4 pr-2 font-mono text-[14px] tracking-widest ring-1 ring-paper/30 transition hover:bg-paper/25"
        >
          {o.code}
          <span className="grid h-8 w-8 place-items-center rounded-full bg-paper text-accent">{copied ? <Check size={14} /> : <Copy size={14} />}</span>
        </button>
      </div>
    </motion.div>
  );
}
