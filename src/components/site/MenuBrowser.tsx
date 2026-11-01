"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import clsx from "clsx";
import type { Category, DietTag, MenuItem } from "@/lib/types";
import { money } from "@/lib/format";
import { useLenis, useSite } from "./providers";
import { EASE } from "./motion";
import AddButton, { TAG_LABEL, VegMark } from "./home/AddButton";

const FILTERS: DietTag[] = ["veg", "vegan", "gf", "spicy", "chef", "new"];

export default function MenuBrowser({ categories, items }: { categories: Category[]; items: MenuItem[] }) {
  const s = useSite();
  const lenis = useLenis();
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<DietTag[]>([]);
  const [active, setActive] = useState(categories[0]?.id);
  const [view, setView] = useState<MenuItem | null>(null);
  const refs = useRef<Record<string, HTMLElement | null>>({});

  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (!q || `${i.name} ${i.description}`.toLowerCase().includes(q.toLowerCase())) &&
          filters.every((f) => i.tags.includes(f))
      ),
    [items, q, filters]
  );

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.getAttribute("data-cat") || ""));
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    Object.values(refs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [filtered]);

  useEffect(() => {
    if (view) lenis.current?.stop();
    else lenis.current?.start();
  }, [view, lenis]);

  return (
    <>
      {/* sticky controls */}
      <div className="sticky top-[86px] z-30 mx-auto max-w-[1400px] px-3 sm:px-8">
        <div className="flex flex-col gap-2 rounded-[24px] bg-paper/95 backdrop-blur-xl p-2 ring-1 ring-ink/5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.3)] md:flex-row md:items-center">
          <div className="flex h-11 items-center gap-2 rounded-full bg-ink/5 px-4 md:w-64">
            <Search size={16} className="opacity-50" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes" className="w-full bg-transparent text-[15px] outline-none" />
            {q && (
              <button onClick={() => setQ("")} aria-label="Clear"><X size={14} /></button>
            )}
          </div>
          <div className="-mx-2 flex gap-1 overflow-x-auto px-2 no-scrollbar md:mx-0 md:flex-1 md:px-0">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => lenis.current?.scrollTo(refs.current[c.id] as HTMLElement, { offset: -180 })}
                className={clsx("relative h-10 shrink-0 rounded-full px-4 text-[13.5px] transition-colors", active === c.id ? "text-paper" : "text-ink/70 hover:text-ink")}
              >
                {active === c.id && <motion.span layoutId="menu-cat" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.45, ease: EASE }} />}
                <span className="relative">{c.name}</span>
              </button>
            ))}
          </div>
          <div className="-mx-2 flex gap-1 overflow-x-auto px-2 no-scrollbar md:mx-0 md:px-0">
            {FILTERS.map((f) => {
              const on = filters.includes(f);
              return (
                <button
                  key={f}
                  onClick={() => setFilters((v) => (on ? v.filter((x) => x !== f) : [...v, f]))}
                  className={clsx("h-9 shrink-0 rounded-full border px-3 text-[12.5px] transition", on ? "border-accent bg-accent text-paper" : "border-ink/10 hover:border-ink/30")}
                >
                  {TAG_LABEL[f]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 pb-32 pt-10 sm:px-10">
        {filtered.length === 0 && <p className="py-24 text-center text-muted">Nothing matches — try fewer filters.</p>}
        {categories.map((c) => {
          const list = filtered.filter((i) => i.categoryId === c.id);
          if (!list.length) return null;
          return (
            <section key={c.id} ref={(el) => { refs.current[c.id] = el; }} data-cat={c.id} className="scroll-mt-48 pt-14">
              <div className="mb-8 flex items-end justify-between gap-6 border-b border-line pb-5">
                <h2 className="display text-[40px] sm:text-[52px]">{c.name}</h2>
                <p className="hidden text-muted sm:block">{c.description}</p>
              </div>
              <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((item, i) => (
                  <motion.article
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "0px 0px -5% 0px" }}
                    transition={{ duration: 0.7, ease: EASE, delay: (i % 3) * 0.06 }}
                    className={clsx("group cursor-pointer", !item.available && "opacity-50")}
                    onClick={() => setView(item)}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-ink/5">
                      <motion.img layoutId={`img-${item.id}`} src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                        {item.tags.filter((t) => t !== "veg").slice(0, 2).map((t) => (
                          <span key={t} className="glass rounded-full px-2.5 py-1 text-[11px] text-paper">{TAG_LABEL[t]}</span>
                        ))}
                        {!item.available && <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] text-paper">Sold out today</span>}
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <AddButton item={item} className="!bg-paper !text-ink hover:!bg-accent hover:!text-paper shadow-lg" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <h3 className="flex items-center gap-2 text-[19px] font-medium tracking-tight">
                        <VegMark veg={item.tags.includes("veg")} /> {item.name}
                      </h3>
                      <span className="font-mono text-[15px] tabular-nums">{money(item.price, s.ordering.currency)}</span>
                    </div>
                    <p className="mt-1 text-[14.5px] text-muted">{item.description}</p>
                  </motion.article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Quick view */}
      <AnimatePresence>
        {view && (
          <>
            <motion.div className="fixed inset-0 z-[70] bg-ink/60 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setView(null)} />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[71] mx-auto max-w-3xl overflow-hidden rounded-t-[30px] bg-paper sm:inset-x-6 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-[30px]"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              data-lenis-prevent
            >
              <div className="grid sm:grid-cols-2">
                <div className="relative aspect-[4/3] sm:aspect-auto">
                  <motion.img layoutId={`img-${view.id}`} src={view.image} alt={view.name} className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <div className="flex flex-col p-6 sm:p-8">
                  <button onClick={() => setView(null)} aria-label="Close" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-paper/90 text-ink">
                    <X size={18} />
                  </button>
                  <div className="flex flex-wrap gap-1.5">
                    {view.tags.map((t) => (
                      <span key={t} className="rounded-full bg-ink/5 px-2.5 py-1 text-[11px]">{TAG_LABEL[t]}</span>
                    ))}
                  </div>
                  <h3 className="display mt-4 text-[34px]">{view.name}</h3>
                  <p className="mt-3 text-muted">{view.description}</p>
                  <div className="mt-auto flex items-center justify-between pt-8">
                    <span className="display text-[28px] tabular-nums">{money(view.price, s.ordering.currency)}</span>
                    <AddButton item={view} label />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
