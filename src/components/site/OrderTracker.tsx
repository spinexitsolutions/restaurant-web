"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, ChefHat, Package, Bike, PartyPopper, Receipt } from "lucide-react";
import clsx from "clsx";
import type { OrderLine, OrderStatus, OrderType } from "@/lib/types";
import { money } from "@/lib/format";
import { useSite } from "./providers";
import { EASE } from "./motion";

interface Tracked {
  code: string;
  status: OrderStatus;
  type: OrderType;
  items: OrderLine[];
  total: number;
  createdAt: string;
  name: string;
}

export default function OrderTracker({ initial }: { initial: Tracked }) {
  const s = useSite();
  const [o, setO] = useState(initial);
  useEffect(() => {
    if (o.status === "completed" || o.status === "cancelled") return;
    const t = setInterval(async () => {
      const r = await fetch(`/api/orders/${o.code}`, { cache: "no-store" });
      if (r.ok) setO(await r.json());
    }, 8000);
    return () => clearInterval(t);
  }, [o.code, o.status]);

  const steps = [
    { k: "new", l: "Order received", Icon: Receipt },
    { k: "preparing", l: "In the kitchen", Icon: ChefHat },
    { k: "ready", l: o.type === "pickup" ? "Ready for pickup" : "Packed & ready", Icon: Package },
    ...(o.type === "delivery" ? [{ k: "out-for-delivery", l: "On the way", Icon: Bike }] : []),
    { k: "completed", l: o.type === "pickup" ? "Collected" : "Delivered", Icon: PartyPopper },
  ];
  const idx = steps.findIndex((x) => x.k === o.status);

  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 px-5 pb-32 sm:px-10 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-[30px] bg-ink p-6 text-paper sm:p-10">
        <div className="flex items-center justify-between">
          <span className="eyebrow text-paper/50">Order #{o.code}</span>
          <span className="flex items-center gap-2 text-[13px] text-paper/60">
            <span className="pulse-dot h-2 w-2 rounded-full bg-emerald-400 text-emerald-400" /> Live
          </span>
        </div>
        {o.status === "cancelled" ? (
          <h2 className="display mt-8 text-[34px]">This order was cancelled.</h2>
        ) : (
          <>
            <h2 className="display mt-8 text-[34px] sm:text-[44px]">
              Thank you, {o.name}. <em className="text-accent-soft">{steps[idx]?.l}.</em>
            </h2>
            <ol className="mt-10 space-y-0">
              {steps.map((st, i) => {
                const done = i <= idx;
                return (
                  <li key={st.k} className="relative flex gap-4 pb-8 last:pb-0">
                    {i < steps.length - 1 && (
                      <span className="absolute left-5 top-10 h-[calc(100%-40px)] w-px bg-white/15">
                        <motion.span className="block w-full bg-accent" initial={{ height: 0 }} animate={{ height: i < idx ? "100%" : "0%" }} transition={{ duration: 0.8, ease: EASE, delay: i * 0.15 }} />
                      </span>
                    )}
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.12, ease: EASE }}
                      className={clsx("relative grid h-10 w-10 shrink-0 place-items-center rounded-full", done ? "bg-accent" : "bg-white/10 text-paper/40", i === idx && "ring-4 ring-accent/30")}
                    >
                      {i < idx ? <Check size={16} /> : <st.Icon size={16} />}
                    </motion.span>
                    <span className={clsx("pt-2 text-[16px]", done ? "text-paper" : "text-paper/40")}>{st.l}</span>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
      <div className="rounded-[30px] bg-cream p-6 ring-1 ring-ink/5 sm:p-10">
        <h3 className="display text-[28px]">Receipt</h3>
        <ul className="mt-6 divide-y divide-line">
          {o.items.map((l) => (
            <li key={l.itemId} className="flex justify-between py-3 text-[15px]">
              <span>{l.qty} × {l.name}</span>
              <span className="font-mono tabular-nums">{money(l.price * l.qty, s.ordering.currency)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-baseline justify-between border-t border-ink pt-4">
          <span>Total paid</span>
          <span className="display text-[28px] tabular-nums">{money(o.total, s.ordering.currency)}</span>
        </div>
        <p className="mt-6 text-[14px] text-muted">Questions? Call <a href={`tel:${s.contact.phone}`} className="text-ink underline">{s.contact.phone}</a> and quote #{o.code}.</p>
        <Link href="/menu" className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-6 text-[14px] text-paper">Back to menu</Link>
      </div>
    </div>
  );
}
