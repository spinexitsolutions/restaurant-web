"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import type { Category, MenuItem } from "@/lib/types";
import { money } from "@/lib/format";
import { useSite } from "../providers";
import { EASE, RevealText, SectionLabel } from "../motion";
import AddButton, { VegMark } from "./AddButton";

export default function MenuPreview({ categories, items }: { categories: Category[]; items: MenuItem[] }) {
  const s = useSite();
  const [cat, setCat] = useState(categories[0]?.id);
  const [hover, setHover] = useState<MenuItem | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 260, damping: 28 });
  const y = useSpring(my, { stiffness: 260, damping: 28 });
  const shown = items.filter((i) => i.categoryId === cat).slice(0, 6);

  return (
    <section className="relative mx-auto max-w-[1400px] px-5 py-28 sm:px-10 sm:py-36">
      <div className="mb-14 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div>
          <SectionLabel index="04" className="mb-8 text-muted">
            The menu
          </SectionLabel>
          <RevealText as="h2" text="Something for every craving." className="display block max-w-[12ch] text-[13vw] sm:text-7xl lg:text-8xl" />
        </div>
        <div className="-mx-5 overflow-x-auto px-5 no-scrollbar sm:mx-0 sm:px-0">
          <div className="flex w-max gap-1 rounded-full bg-ink/[0.05] p-1">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={clsx("relative h-10 rounded-full px-4 text-[13.5px] transition-colors", cat === c.id ? "text-paper" : "text-ink/70 hover:text-ink")}
              >
                {cat === c.id && <motion.span layoutId="menu-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.5, ease: EASE }} />}
                <span className="relative">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="relative"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set(e.clientX - r.left);
          my.set(e.clientY - r.top);
        }}
        onPointerLeave={() => setHover(null)}
      >
        <AnimatePresence mode="wait">
          <motion.ul key={cat} className="border-t border-line" initial="hidden" animate="show" exit="exit">
            {shown.map((item, i) => (
              <motion.li
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: i * 0.05 } },
                  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
                }}
                onPointerEnter={(e) => e.pointerType === "mouse" && setHover(item)}
                className="group grid grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-line py-5 sm:grid-cols-[1fr_auto] sm:py-7"
              >
                <img src={item.image} alt="" className="h-16 w-16 rounded-2xl object-cover sm:hidden" loading="lazy" />
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <VegMark veg={item.tags.includes("veg")} />
                    <h3 className="display truncate text-[26px] transition-all duration-500 group-hover:translate-x-2 group-hover:italic sm:text-5xl">{item.name}</h3>
                  </div>
                  <p className="mt-1 line-clamp-1 text-[14px] text-muted sm:pl-[26px] sm:text-[15px]">{item.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-6">
                  <span className="font-mono text-[15px] tabular-nums sm:text-lg">{money(item.price, s.ordering.currency)}</span>
                  <AddButton item={item} />
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>

        {/* floating preview */}
        <motion.div
          style={{ x, y, translateX: "-50%", translateY: "-50%" }}
          className="pointer-events-none absolute left-0 top-0 z-10 hidden h-64 w-52 overflow-hidden rounded-[22px] shadow-2xl md:block"
          animate={{ opacity: hover ? 1 : 0, scale: hover ? 1 : 0.6, rotate: hover ? -4 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <AnimatePresence mode="popLayout">
            {hover && (
              <motion.img
                key={hover.id}
                src={hover.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                initial={{ opacity: 0, scale: 1.2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="mt-12 flex justify-center">
        <Link href="/menu" className="group flex h-14 items-center gap-3 rounded-full border border-ink/15 pl-7 pr-2 text-[15px] transition-colors hover:bg-ink hover:text-paper">
          See the full menu
          <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-paper transition-transform group-hover:rotate-45">
            <ArrowUpRight size={18} />
          </span>
        </Link>
      </div>
    </section>
  );
}
