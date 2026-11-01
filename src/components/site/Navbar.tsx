"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, Home, LayoutGrid, ShoppingBag, UtensilsCrossed, X } from "lucide-react";
import clsx from "clsx";
import { useCart, useIntro, useLenis, useSite } from "./providers";
import { EASE } from "./motion";
import { openStatus } from "@/lib/format";
import { Insta, Fb, XIcon, Yt } from "./icons";
import Btn from "./Button";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/reserve", label: "Reserve" },
  { href: "/order", label: "Order online" },
  { href: "/events", label: "Experiences" },
  { href: "/gallery", label: "Gallery" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "Our story" },
  { href: "/contact", label: "Contact" },
];
const INLINE = ["/menu", "/events", "/gallery", "/journal", "/about"];
const SPRING = { type: "spring", stiffness: 380, damping: 34, mass: 0.8 } as const;

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

/**
 * "Converging islands" navbar.
 * Desktop: logo, links and actions float as three separate pills at the top
 * of the page; once you scroll they glide together and fuse into one capsule.
 * Mobile: an iOS-style tab bar at the bottom with a raised Reserve button.
 */
export default function Navbar({ previews }: { previews: string[] }) {
  const s = useSite();
  const cart = useCart();
  const lenis = useLenis();
  const { done } = useIntro();
  const pathname = usePathname();
  const [sheet, setSheet] = useState(false);
  const [merged, setMerged] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [hover, setHover] = useState<string | null>(null);
  const [preview, setPreview] = useState(0);
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);
  const [annDismissed, setAnnDismissed] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  useEffect(() => {
    setStatus(openStatus(s.hours));
    const t = setInterval(() => setStatus(openStatus(s.hours)), 60_000);
    return () => clearInterval(t);
  }, [s.hours]);

  useEffect(() => setSheet(false), [pathname]);
  useEffect(() => {
    if (sheet) lenis.current?.stop();
    else if (done && !cart.open) lenis.current?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet, lenis, done, cart.open]);

  useMotionValueEvent(scrollY, "change", (y) => {
    setAtTop(y < 40);
    setMerged(y > 90);
  });

  const showAnn = s.announcement.enabled && !annDismissed && atTop && !sheet;
  const top = showAnn ? 48 : 14;
  const activeInline = INLINE.find((h) => pathname.startsWith(h));

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
            className="fixed inset-x-0 top-0 z-50 flex h-9 items-center justify-center gap-3 bg-ink px-10 text-[12.5px] text-white"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <Link href={s.announcement.link || "#"} className="truncate hover:underline underline-offset-4">
              {s.announcement.text}
            </Link>
            <button aria-label="Dismiss" onClick={() => setAnnDismissed(true)} className="absolute right-3 opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────── Desktop: converging islands ───────── */}
      <motion.header
        className="pointer-events-none fixed inset-x-0 z-50 hidden px-6 lg:block"
        initial={{ y: -90, opacity: 0 }}
        animate={{ top, y: done ? 0 : -90, opacity: done ? 1 : 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <LayoutGroup>
          <motion.div
            layout
            transition={SPRING}
            style={{ borderRadius: 999 }}
            className={clsx(
              "pointer-events-auto relative mx-auto flex items-center transition-[background-color,box-shadow] duration-500",
              merged ? "glass-light w-fit gap-1 p-1.5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.06]" : "w-full max-w-[1400px] justify-between gap-4 bg-transparent"
            )}
          >
            {/* Logo island */}
            <motion.div layout transition={SPRING} style={{ borderRadius: 999 }} className={clsx("flex h-12 items-center transition-all duration-500", merged ? "pl-3 pr-1" : "glass-light px-5 shadow-[0_6px_24px_-12px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.05]")}>
              <Link href="/" className="group flex items-center gap-2" aria-label={s.brand.name}>
                <motion.span
                  layout
                  className="grid h-7 w-7 place-items-center rounded-full bg-accent text-[13px] font-semibold text-white transition-transform duration-500 group-hover:rotate-[360deg]"
                >
                  {s.brand.name[0]}
                </motion.span>
                <motion.span layout="position" className="text-[17px] font-semibold tracking-tight">
                  {s.brand.name}
                </motion.span>
              </Link>
              <AnimatePresence initial={false}>
                {!merged && status && (
                  <motion.span
                    initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                    animate={{ opacity: 1, width: "auto", marginLeft: 14 }}
                    exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="flex items-center gap-2 overflow-hidden whitespace-nowrap border-l border-ink/10 pl-3.5 text-[12.5px] text-muted"
                  >
                    <span className={clsx("pulse-dot h-1.5 w-1.5 rounded-full", status.open ? "bg-emerald-500 text-emerald-500" : "bg-ink/30 text-ink/30")} />
                    {status.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Links island */}
            <motion.nav
              layout
              transition={SPRING}
              style={{ borderRadius: 999 }}
              onMouseLeave={() => setHover(null)}
              className={clsx("relative flex h-12 items-center px-1.5 transition-all duration-500", !merged && "glass-light shadow-[0_6px_24px_-12px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.05]")}
            >
              {LINKS.filter((l) => INLINE.includes(l.href)).map((l) => {
                const active = activeInline === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onMouseEnter={() => setHover(l.href)}
                    className={clsx("relative px-4 py-2 text-[14px] transition-colors duration-300", active || hover === l.href ? "text-ink" : "text-ink/60")}
                  >
                    {hover === l.href && (
                      <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-ink/[0.06]" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
                    )}
                    <span className="relative">{l.label}</span>
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute -bottom-0.5 left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full bg-accent"
                        transition={{ type: "spring", stiffness: 420, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </motion.nav>

            {/* Actions island */}
            <motion.div layout transition={SPRING} style={{ borderRadius: 999 }} className={clsx("flex h-12 items-center gap-1 transition-all duration-500", !merged && "glass-light pl-1.5 pr-1.5 shadow-[0_6px_24px_-12px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.05]")}>
              <BagButton onClick={() => cart.setOpen(true)} count={cart.count} bump={cart.bump} />
              <button
                aria-label="All pages"
                onClick={() => setSheet(true)}
                className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-ink/[0.06]"
              >
                <LayoutGrid size={17} strokeWidth={1.7} />
              </button>
              <Btn href="/reserve" size="sm" className="!h-10 !pl-4">
                Book a table
              </Btn>
            </motion.div>

            {/* scroll progress ring under the capsule */}
            {merged && <motion.div style={{ scaleX: progress }} className="absolute inset-x-8 -bottom-[3px] h-[2px] origin-left rounded-full bg-accent" />}
          </motion.div>
        </LayoutGroup>
      </motion.header>

      {/* ───────── Mobile: top logo chip ───────── */}
      <motion.div
        className="fixed inset-x-3 z-50 flex items-center justify-between lg:hidden"
        initial={{ opacity: 0, y: -40 }}
        animate={{ top: showAnn ? 46 : 10, opacity: done ? (merged ? 0 : 1) : 0, y: done ? (merged ? -20 : 0) : -40 }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{ pointerEvents: merged ? "none" : "auto" }}
      >
        <Link href="/" className="glass-light flex h-11 items-center gap-2 rounded-full pl-1.5 pr-4 shadow-[0_6px_20px_-10px_rgba(0,0,0,0.2)] ring-1 ring-black/5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-[14px] font-semibold text-white">{s.brand.name[0]}</span>
          <span className="text-[16px] font-semibold tracking-tight">{s.brand.name}</span>
        </Link>
        {status && (
          <span className="glass-light flex h-11 items-center gap-2 rounded-full px-4 text-[12.5px] text-muted shadow-[0_6px_20px_-10px_rgba(0,0,0,0.2)] ring-1 ring-black/5">
            <span className={clsx("pulse-dot h-1.5 w-1.5 rounded-full", status.open ? "bg-emerald-500 text-emerald-500" : "bg-ink/30 text-ink/30")} />
            {status.label}
          </span>
        )}
      </motion.div>

      {/* ───────── Mobile: iOS-style tab bar ───────── */}
      <TabBar visible={done && !cart.open} onMore={() => setSheet((v) => !v)} sheetOpen={sheet} />

      {/* ───────── Sheet with every page ───────── */}
      <AnimatePresence>
        {sheet && (
          <>
            <motion.div className="fixed inset-0 z-[55] bg-black/25 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <motion.div
              data-lenis-prevent
              initial={{ y: "100%", opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.6 }}
              transition={{ type: "spring", stiffness: 260, damping: 32 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, i) => i.offset.y > 120 && setSheet(false)}
              className="fixed inset-x-0 bottom-0 z-[56] max-h-[88dvh] overflow-y-auto rounded-t-[32px] bg-white px-5 pb-28 pt-3 lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:top-20 lg:w-[960px] lg:-translate-x-1/2 lg:rounded-[32px] lg:pb-7 lg:pt-7 lg:shadow-2xl"
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-ink/15 lg:hidden" />
              <div className="mb-5 flex items-center justify-between">
                <span className="text-[13px] font-medium text-muted">Explore {s.brand.name}</span>
                <button onClick={() => setSheet(false)} aria-label="Close" className="hidden h-10 w-10 place-items-center rounded-full bg-ink/5 hover:bg-ink/10 lg:grid">
                  <X size={18} />
                </button>
              </div>
              <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3" onMouseLeave={() => setPreview(0)}>
                  {LINKS.map((l, i) => {
                    const active = isActive(pathname, l.href);
                    return (
                      <motion.li key={l.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.03, duration: 0.5, ease: EASE }}>
                        <Link
                          href={l.href}
                          onMouseEnter={() => setPreview(i)}
                          className={clsx(
                            "group flex h-24 flex-col justify-between rounded-[20px] p-4 transition-colors duration-300",
                            active ? "bg-accent text-white" : "bg-mist hover:bg-ink hover:text-white"
                          )}
                        >
                          <span className={clsx("text-[11px] tabular-nums", active ? "text-white/70" : "text-muted group-hover:text-white/60")}>{String(i + 1).padStart(2, "0")}</span>
                          <span className="flex items-end justify-between text-[17px] font-semibold tracking-tight">
                            {l.label}
                            <ArrowUpRight size={16} className="opacity-0 transition-all duration-300 group-hover:opacity-100" />
                          </span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
                <div className="hidden flex-col gap-4 lg:flex">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-mist">
                    <AnimatePresence mode="popLayout">
                      <motion.img
                        key={preview}
                        src={previews[preview % previews.length]}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        initial={{ opacity: 0, scale: 1.08 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: EASE }}
                      />
                    </AnimatePresence>
                  </div>
                  <div className="text-[14px] text-muted">
                    {s.contact.address}, {s.contact.city}
                    <br />
                    <a href={`tel:${s.contact.phone}`} className="text-ink hover:text-accent">{s.contact.phone}</a> · <a href={`mailto:${s.contact.email}`} className="text-ink hover:text-accent">{s.contact.email}</a>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
                <Socials />
                <Btn href="/reserve" size="sm">Book a table</Btn>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function BagButton({ onClick, count, bump }: { onClick: () => void; count: number; bump: number }) {
  return (
    <button aria-label="Open bag" onClick={onClick} className="relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-ink/[0.06]">
      <ShoppingBag size={17} strokeWidth={1.7} />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={bump}
            initial={{ scale: 0.4 }}
            animate={{ scale: [1.5, 1] }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute right-0.5 top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function TabBar({ visible, onMore, sheetOpen }: { visible: boolean; onMore: () => void; sheetOpen: boolean }) {
  const pathname = usePathname();
  const cart = useCart();
  const tabs = [
    { key: "/", label: "Home", Icon: Home, href: "/" },
    { key: "/menu", label: "Menu", Icon: UtensilsCrossed, href: "/menu" },
    { key: "reserve", label: "Reserve", Icon: CalendarDays, href: "/reserve" },
    { key: "bag", label: "Bag", Icon: ShoppingBag },
    { key: "more", label: "More", Icon: LayoutGrid },
  ];
  const current = sheetOpen ? "more" : pathname === "/" ? "/" : pathname.startsWith("/menu") ? "/menu" : pathname.startsWith("/reserve") ? "reserve" : pathname.startsWith("/order") ? "bag" : "";

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="fixed inset-x-3 z-[57] lg:hidden"
          style={{ bottom: "max(10px, env(safe-area-inset-bottom))" }}
          aria-label="Quick navigation"
        >
          <div className="glass-light mx-auto flex h-[66px] max-w-md items-center justify-between rounded-[26px] px-2 shadow-[0_16px_40px_-14px_rgba(0,0,0,0.3)] ring-1 ring-black/[0.06]">
            {tabs.map(({ key, label, Icon, href }) => {
              const active = current === key;
              if (key === "reserve") {
                return (
                  <Link key={key} href={href!} aria-label="Reserve a table" className="relative -mt-7 flex flex-col items-center gap-1">
                    <motion.span
                      whileTap={{ scale: 0.9 }}
                      className="grid h-14 w-14 place-items-center rounded-full bg-accent text-white shadow-[0_10px_24px_-8px_var(--accent)] ring-4 ring-paper"
                    >
                      <Icon size={22} strokeWidth={1.8} />
                    </motion.span>
                    <span className={clsx("text-[10.5px] font-medium", active ? "text-accent" : "text-ink/60")}>{label}</span>
                  </Link>
                );
              }
              const content = (
                <>
                  {active && <motion.span layoutId="tab-active" className="absolute inset-x-1 inset-y-1.5 rounded-[18px] bg-ink/[0.06]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <span className="relative">
                    <Icon size={21} strokeWidth={active ? 2 : 1.6} className={active ? "text-accent" : "text-ink/70"} />
                    {key === "bag" && cart.count > 0 && (
                      <motion.span key={cart.bump} animate={{ scale: [1.5, 1] }} className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-semibold text-white">
                        {cart.count}
                      </motion.span>
                    )}
                  </span>
                  <span className={clsx("relative text-[10.5px] font-medium", active ? "text-accent" : "text-ink/60")}>{label}</span>
                </>
              );
              const cls = "relative flex h-full w-16 flex-col items-center justify-center gap-1";
              if (key === "bag") return <button key={key} className={cls} onClick={() => cart.setOpen(true)} aria-label="Open bag">{content}</button>;
              if (key === "more") return <button key={key} className={cls} onClick={onMore} aria-label="More pages">{content}</button>;
              return <Link key={key} href={href!} className={cls}>{content}</Link>;
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
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
    <div className={clsx("flex gap-1.5", className)}>
      {items.map(({ href, Icon, label }) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-full bg-ink/[0.05] text-ink/70 transition hover:bg-accent hover:text-white">
          <Icon width={15} height={15} />
        </a>
      ))}
    </div>
  );
}
