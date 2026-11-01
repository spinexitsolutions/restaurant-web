"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight, ShoppingBag, X, CalendarDays } from "lucide-react";
import clsx from "clsx";
import { useCart, useIntro, useLenis, useSite } from "./providers";
import { EASE } from "./motion";
import { openStatus } from "@/lib/format";
import { Insta, Fb, XIcon, Yt } from "./icons";

const LINKS = [
  { href: "/", label: "Home", img: 0 },
  { href: "/menu", label: "Menu", img: 1 },
  { href: "/reserve", label: "Reserve", img: 2 },
  { href: "/order", label: "Order online", img: 3 },
  { href: "/events", label: "Experiences", img: 4 },
  { href: "/gallery", label: "Gallery", img: 5 },
  { href: "/journal", label: "Journal", img: 6 },
  { href: "/about", label: "Our story", img: 7 },
  { href: "/contact", label: "Contact", img: 8 },
];
const INLINE = ["/menu", "/events", "/journal", "/about"];

export default function Navbar({ previews }: { previews: string[] }) {
  const s = useSite();
  const cart = useCart();
  const lenis = useLenis();
  const { done } = useIntro();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [hover, setHover] = useState(0);
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);
  const [annDismissed, setAnnDismissed] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  useEffect(() => {
    setStatus(openStatus(s.hours));
    const t = setInterval(() => setStatus(openStatus(s.hours)), 60_000);
    return () => clearInterval(t);
  }, [s.hours]);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (open) lenis.current?.stop();
    else if (done && !cart.open) lenis.current?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lenis, done, cart.open]);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setAtTop(y < 40);
    setCompact(y > 160);
    setHidden(y > 600 && y > prev + 4 ? true : y < prev - 4 ? false : hidden);
  });

  const showAnn = s.announcement.enabled && !annDismissed && atTop && !open;
  const top = showAnn ? 48 : 12;

  return (
    <>
      {/* Announcement */}
      <AnimatePresence>
        {showAnn && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: done ? 1 : 0 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="fixed inset-x-0 top-0 z-50 flex h-9 items-center justify-center gap-3 bg-accent px-10 text-[12.5px] text-paper"
          >
            <Link href={s.announcement.link || "#"} className="truncate hover:underline underline-offset-4">
              {s.announcement.text}
            </Link>
            <button aria-label="Dismiss" onClick={() => setAnnDismissed(true)} className="absolute right-3 opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* The Island */}
      <motion.header
        className="fixed inset-x-0 z-50 flex justify-center px-3 pointer-events-none"
        initial={{ y: -100, opacity: 0 }}
        animate={{ top, y: done ? (hidden && !open ? -110 : 0) : -100, opacity: done ? 1 : 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <LayoutGroup>
          <motion.nav
            layout
            transition={{ layout: { duration: 0.65, ease: EASE } }}
            style={{ borderRadius: open ? 30 : 999 }}
            className={clsx(
              "glass pointer-events-auto relative overflow-hidden text-paper shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] ring-1 ring-white/10",
              open ? "w-full max-w-[1040px] h-[calc(100dvh-24px)] sm:h-auto" : "w-auto"
            )}
          >
            {/* bar */}
            <motion.div layout="position" className="flex h-14 items-center gap-1 pl-5 pr-1.5">
              <Link href="/" className="group flex items-baseline gap-1.5 pr-2" aria-label={s.brand.name}>
                <span className="display text-[26px] leading-none">{s.brand.name}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-accent transition-transform group-hover:scale-150" />
              </Link>

              <AnimatePresence initial={false}>
                {!compact && !open && status && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="hidden items-center gap-2 overflow-hidden whitespace-nowrap border-l border-white/15 pl-3 pr-2 text-[12px] text-paper/70 sm:flex"
                  >
                    <span className={clsx("pulse-dot h-1.5 w-1.5 rounded-full", status.open ? "bg-emerald-400 text-emerald-400" : "bg-paper/40 text-paper/40")} />
                    {status.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {!open && (
                <div className="hidden items-center lg:flex" onMouseLeave={() => setHover(-1)}>
                  {LINKS.filter((l) => INLINE.includes(l.href)).map((l, i) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onMouseEnter={() => setHover(i + 100)}
                      className={clsx("relative px-3.5 py-2 text-[13.5px] transition-colors", pathname.startsWith(l.href) ? "text-paper" : "text-paper/65 hover:text-paper")}
                    >
                      {hover === i + 100 && (
                        <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-white/10" transition={{ duration: 0.35, ease: EASE }} />
                      )}
                      <span className="relative">{l.label}</span>
                      {pathname.startsWith(l.href) && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />}
                    </Link>
                  ))}
                </div>
              )}

              <div className="ml-auto flex items-center gap-1 pl-2">
                {!open && (
                  <Link
                    href="/reserve"
                    className="hidden h-11 items-center gap-2 rounded-full bg-paper px-4 text-[13px] font-medium text-ink transition-transform hover:scale-[1.03] active:scale-95 sm:flex"
                  >
                    <CalendarDays size={15} /> Book
                  </Link>
                )}
                <button
                  aria-label="Open bag"
                  onClick={() => {
                    setOpen(false);
                    cart.setOpen(true);
                  }}
                  className="relative grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-white/10"
                >
                  <ShoppingBag size={18} strokeWidth={1.6} />
                  <AnimatePresence>
                    {cart.count > 0 && (
                      <motion.span
                        key={cart.bump}
                        initial={{ scale: 0.4 }}
                        animate={{ scale: [1.5, 1] }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-paper"
                      >
                        {cart.count}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <button
                  aria-label={open ? "Close menu" : "Open menu"}
                  aria-expanded={open}
                  onClick={() => setOpen((v) => !v)}
                  className="relative grid h-11 w-11 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  <motion.span className="absolute h-[1.5px] w-4 rounded bg-paper" animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -3 }} transition={{ duration: 0.4, ease: EASE }} />
                  <motion.span className="absolute h-[1.5px] w-4 rounded bg-paper" animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 3 }} transition={{ duration: 0.4, ease: EASE }} />
                </button>
              </div>
            </motion.div>

            {/* expanded panel */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.25, duration: 0.4 } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="flex h-[calc(100%-56px)] flex-col px-5 pb-5 sm:h-auto sm:px-7 sm:pb-7"
                >
                  <div className="grid flex-1 gap-8 overflow-y-auto pt-4 no-scrollbar sm:grid-cols-[1.25fr_1fr] sm:pt-6">
                    <ul onMouseLeave={() => setHover(LINKS.findIndex((l) => l.href === pathname))}>
                      {LINKS.map((l, i) => {
                        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
                        return (
                          <li key={l.href} className="overflow-hidden">
                            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.2 + i * 0.04 }}>
                              <Link
                                href={l.href}
                                onMouseEnter={() => setHover(i)}
                                className="group flex items-baseline gap-4 py-1 sm:py-0.5"
                              >
                                <span className="w-6 font-mono text-[11px] text-paper/40">{String(i + 1).padStart(2, "0")}</span>
                                <span
                                  className={clsx(
                                    "mega text-[46px] leading-[0.95] transition-all duration-500 sm:text-[60px]",
                                    active ? "text-accent-soft" : "text-paper group-hover:translate-x-2 group-hover:text-accent-soft"
                                  )}
                                >
                                  {l.label}
                                </span>
                              </Link>
                            </motion.div>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="hidden flex-col gap-4 sm:flex">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-white/5">
                        <AnimatePresence mode="popLayout">
                          <motion.img
                            key={hover}
                            src={previews[Math.max(0, hover) % previews.length]}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                            initial={{ opacity: 0, scale: 1.15, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.7, ease: EASE }}
                          />
                        </AnimatePresence>
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                        <p className="absolute bottom-4 left-4 right-4 text-sm text-paper/80">{s.brand.tagline}</p>
                      </div>
                    </div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                    className="mt-5 grid gap-4 border-t border-white/10 pt-5 text-[13px] text-paper/70 sm:grid-cols-3 sm:items-end"
                  >
                    <div>
                      <div className="eyebrow mb-1 text-paper/40">Visit</div>
                      {s.contact.address}, {s.contact.city}
                    </div>
                    <div>
                      <div className="eyebrow mb-1 text-paper/40">Talk</div>
                      <a href={`tel:${s.contact.phone}`} className="block hover:text-paper">{s.contact.phone}</a>
                      <a href={`mailto:${s.contact.email}`} className="block hover:text-paper">{s.contact.email}</a>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <Socials />
                      <Link href="/reserve" className="flex h-11 items-center gap-2 rounded-full bg-accent px-5 font-medium text-paper">
                        Reserve <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* scroll progress hairline */}
            {!open && <motion.div style={{ scaleX: progress }} className="absolute bottom-0 left-6 right-6 h-px origin-left bg-accent/80" />}
          </motion.nav>
        </LayoutGroup>
      </motion.header>

      <MobileDock visible={done && compact && !open && !cart.open && pathname !== "/reserve" && !pathname.startsWith("/order")} />
    </>
  );
}

export function Socials({ className }: { className?: string }) {
  const s = useSite();
  const items = [
    { href: s.socials.instagram, Icon: Insta, label: "Instagram" },
    { href: s.socials.facebook, Icon: Fb, label: "Facebook" },
    { href: s.socials.x, Icon: XIcon, label: "X" },
    { href: s.socials.youtube, Icon: Yt, label: "YouTube" },
  ].filter((i) => i.href);
  return (
    <div className={clsx("flex gap-1", className)}>
      {items.map(({ href, Icon, label }) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-full border border-current/15 opacity-70 transition hover:opacity-100">
          <Icon width={15} height={15} />
        </a>
      ))}
    </div>
  );
}

function MobileDock({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="fixed inset-x-3 z-40 flex gap-2 sm:hidden"
          style={{ bottom: "max(12px, env(safe-area-inset-bottom))" }}
        >
          <Link href="/order" className="glass flex h-13 flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-sm font-medium text-paper ring-1 ring-white/10">
            <ShoppingBag size={16} /> Order
          </Link>
          <Link href="/reserve" className="flex h-13 flex-1 items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-medium text-paper shadow-lg shadow-accent/30">
            <CalendarDays size={16} /> Reserve
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
