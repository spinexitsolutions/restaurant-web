"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, CalendarDays, ShoppingBag, Users, Inbox, Mail, UtensilsCrossed, Layers, Home, Image as ImageIcon,
  ChefHat, PartyPopper, Newspaper, Ticket, Quote, HelpCircle, Palette, Sparkles, MapPin, Store, Globe, AlertTriangle,
  LogOut, ExternalLink, X, PanelLeftClose, PanelLeftOpen, LayoutGrid, ChevronRight,
} from "lucide-react";
import { ConfirmProvider, ToastProvider, cx } from "./ui";

type Counts = { reservations: number; orders: number; messages: number };
type NavItem = { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; badge?: keyof Counts };

const NAV: { group: string; items: NavItem[] }[] = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    group: "CRM",
    items: [
      { href: "/admin/reservations", label: "Reservations", icon: CalendarDays, badge: "reservations" },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag, badge: "orders" },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/inbox", label: "Inbox", icon: Inbox, badge: "messages" },
      { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
    ],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: Home },
      { href: "/admin/cms/menuItems", label: "Menu items", icon: UtensilsCrossed },
      { href: "/admin/cms/categories", label: "Categories", icon: Layers },
      { href: "/admin/cms/gallery", label: "Gallery", icon: ImageIcon },
      { href: "/admin/cms/team", label: "Team", icon: ChefHat },
      { href: "/admin/cms/events", label: "Events", icon: PartyPopper },
      { href: "/admin/cms/posts", label: "Journal", icon: Newspaper },
      { href: "/admin/cms/offers", label: "Offers", icon: Ticket },
      { href: "/admin/cms/testimonials", label: "Testimonials", icon: Quote },
      { href: "/admin/cms/faqs", label: "FAQs", icon: HelpCircle },
    ],
  },
  {
    group: "Settings",
    items: [
      { href: "/admin/settings/brand", label: "Brand & theme", icon: Palette },
      { href: "/admin/settings/intro", label: "Intro animation", icon: Sparkles },
      { href: "/admin/settings/contact", label: "Contact & hours", icon: MapPin },
      { href: "/admin/settings/operations", label: "Ordering & booking", icon: Store },
      { href: "/admin/settings/seo", label: "SEO", icon: Globe },
      { href: "/admin/settings/danger", label: "Danger zone", icon: AlertTriangle },
    ],
  },
];

const MOBILE_TABS: NavItem[] = [
  { href: "/admin", label: "Home", icon: LayoutDashboard },
  { href: "/admin/reservations", label: "Bookings", icon: CalendarDays, badge: "reservations" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, badge: "orders" },
  { href: "/admin/customers", label: "Guests", icon: Users },
];

function isActive(path: string, href: string) {
  return href === "/admin" ? path === "/admin" : path === href || path.startsWith(href + "/");
}

export default function Shell({ brand, counts, children }: { brand: string; counts: Counts; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMobileOpen(false), [path]);
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("noor-admin-collapsed") === "1");
    } catch {}
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const toggleCollapse = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem("noor-admin-collapsed", c ? "0" : "1");
      } catch {}
      return !c;
    });
  };

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  // breadcrumb
  let crumbGroup = "Overview";
  let crumbLabel = "Dashboard";
  for (const g of NAV) for (const it of g.items) if (isActive(path, it.href)) { crumbGroup = g.group; crumbLabel = it.label; }

  const navList = (compact: boolean, id: string) => (
    <nav className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-3 pb-4">
      {NAV.map((g) => (
        <div key={g.group}>
          {!compact ? (
            <div className="mb-1.5 px-3 text-[11px] font-medium text-muted">{g.group}</div>
          ) : (
            <div className="mx-auto mb-2 h-px w-6 bg-black/10" />
          )}
          <div className="space-y-0.5">
            {g.items.map((it) => {
              const active = isActive(path, it.href);
              const count = it.badge ? counts[it.badge] : 0;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  title={compact ? it.label : undefined}
                  className={cx(
                    "group relative flex h-10 items-center gap-3 rounded-[14px] px-3 text-[14px] transition-colors duration-300",
                    compact && "justify-center px-0",
                    active ? "text-white" : "text-ink/65 hover:bg-ink/[0.045] hover:text-ink"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId={id}
                      transition={{ type: "spring", stiffness: 480, damping: 38 }}
                      className="absolute inset-0 rounded-[14px] bg-ink shadow-[0_8px_20px_-10px_rgba(0,0,0,0.5)]"
                    />
                  )}
                  <it.icon size={17} className={cx("relative z-10 shrink-0 transition-transform duration-300 group-hover:scale-110", active && "text-[var(--accent-soft)]")} />
                  {!compact && <span className="relative z-10 flex-1 truncate font-medium">{it.label}</span>}
                  {count > 0 && (
                    <span
                      className={cx(
                        "relative z-10 grid min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-semibold leading-5",
                        active ? "bg-white text-ink" : "bg-[var(--accent)] text-white",
                        compact && "absolute right-1 top-0.5 min-w-4 leading-4"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const logo = (compact: boolean) => (
    <Link href="/admin" className={cx("flex items-center gap-2.5 px-5 pb-5 pt-5", compact && "justify-center px-0")}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[15px] font-semibold text-white shadow-[0_6px_16px_-6px_var(--accent)]">{brand.charAt(0)}</span>
      {!compact && (
        <div className="leading-tight">
          <div className="text-[16px] font-semibold tracking-tight">{brand}</div>
          <div className="text-[11px] text-muted">Restaurant OS</div>
        </div>
      )}
    </Link>
  );

  const footer = (compact: boolean) => (
    <div className={cx("m-3 mt-0 rounded-[18px] bg-mist p-1.5", compact && "flex flex-col items-center")}>
      <a href="/" target="_blank" className={cx("flex h-9 items-center gap-3 rounded-[12px] px-3 text-[13px] font-medium text-ink/70 transition hover:bg-white hover:text-ink", compact && "w-9 justify-center px-0")}>
        <ExternalLink size={16} /> {!compact && "View website"}
      </a>
      <button onClick={logout} className={cx("flex h-9 w-full items-center gap-3 rounded-[12px] px-3 text-[13px] font-medium text-ink/70 transition hover:bg-white hover:text-red-600", compact && "w-9 justify-center px-0")}>
        <LogOut size={16} /> {!compact && "Log out"}
      </button>
    </div>
  );

  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="min-h-dvh bg-paper font-sans text-ink">
          {/* Desktop: floating island sidebar */}
          <motion.aside
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={cx(
              "glass-light fixed bottom-3 left-3 top-3 z-40 hidden flex-col rounded-[28px] shadow-[0_20px_50px_-24px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.06] transition-[width] duration-500 ease-[cubic-bezier(.22,1,.36,1)] lg:flex",
              collapsed ? "w-[72px]" : "w-[252px]"
            )}
          >
            {logo(collapsed)}
            {navList(collapsed, collapsed ? "anav-c" : "anav")}
            {footer(collapsed)}
            <button onClick={toggleCollapse} className="absolute -right-3 top-7 grid h-6 w-6 place-items-center rounded-full bg-white text-ink/50 shadow-[0_2px_8px_rgba(0,0,0,0.12)] ring-1 ring-black/5 hover:text-ink" aria-label="Collapse sidebar">
              {collapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
            </button>
          </motion.aside>

          <main className={cx("transition-[padding] duration-500 ease-[cubic-bezier(.22,1,.36,1)]", collapsed ? "lg:pl-[84px]" : "lg:pl-[264px]")}>
            {/* Top bar */}
            <header className={cx("sticky top-0 z-30 px-3 pt-3 transition-all duration-300 sm:px-6 lg:px-8")}>
              <div
                className={cx(
                  "mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 rounded-full pl-2 pr-2 transition-all duration-500 lg:pl-5",
                  scrolled ? "glass-light shadow-[0_10px_30px_-16px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.06]" : ""
                )}
              >
                <Link href="/admin" className="flex items-center gap-2 lg:hidden">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--accent)] text-[14px] font-semibold text-white">{brand.charAt(0)}</span>
                  <span className="text-[15px] font-semibold tracking-tight">{brand}</span>
                </Link>
                <div className="hidden items-center gap-1.5 text-[13px] lg:flex">
                  <span className="text-muted">{crumbGroup}</span>
                  <ChevronRight size={14} className="text-muted" />
                  <motion.span key={crumbLabel} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-medium">
                    {crumbLabel}
                  </motion.span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] text-muted shadow-[0_0_0_1px_rgba(0,0,0,0.06)] sm:flex">
                    <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-500 text-emerald-500" /> Live
                  </span>
                  <a href="/" target="_blank" className="abtn hidden h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-medium text-white sm:flex" style={{ "--ab-fill": "var(--accent)" } as React.CSSProperties}>
                    View site <ExternalLink size={13} />
                  </a>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--accent-soft)] text-[13px] font-semibold text-[var(--accent)]">A</span>
                </div>
              </div>
            </header>
            <motion.div
              key={path}
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-[1400px] px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-6"
            >
              {children}
            </motion.div>
          </main>

          {/* Mobile: all-sections sheet */}
          <AnimatePresence>
            {mobileOpen && (
              <div className="fixed inset-0 z-[70] lg:hidden">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/25 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
                <motion.aside
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", stiffness: 280, damping: 34 }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.6 }}
                  onDragEnd={(_, i) => i.offset.y > 120 && setMobileOpen(false)}
                  className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[32px] bg-white pb-24 pt-3"
                >
                  <div className="mx-auto mb-1 h-1.5 w-10 rounded-full bg-ink/15" />
                  <div className="flex items-center justify-between pr-4">
                    {logo(false)}
                    <button onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-black/5" aria-label="Close">
                      <X size={18} />
                    </button>
                  </div>
                  {navList(false, "anav-m")}
                  {footer(false)}
                </motion.aside>
              </div>
            )}
          </AnimatePresence>

          {/* Mobile: iOS-style tab bar */}
          <nav
            className="glass-light fixed inset-x-3 z-[75] flex h-[66px] items-center justify-around rounded-[26px] px-1.5 shadow-[0_16px_40px_-14px_rgba(0,0,0,0.3)] ring-1 ring-black/[0.06] lg:hidden"
            style={{ bottom: "max(10px, env(safe-area-inset-bottom))" }}
          >
            {MOBILE_TABS.map((t) => {
              const active = !mobileOpen && isActive(path, t.href);
              const count = t.badge ? counts[t.badge] : 0;
              return (
                <Link key={t.href} href={t.href} className="relative flex h-full flex-1 flex-col items-center justify-center gap-1">
                  {active && <motion.span layoutId="atab" transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-x-1 inset-y-1.5 rounded-[18px] bg-ink/[0.06]" />}
                  <span className="relative">
                    <t.icon size={20} className={active ? "text-[var(--accent)]" : "text-ink/65"} />
                    {count > 0 && <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-semibold text-white">{count}</span>}
                  </span>
                  <span className={cx("relative text-[10.5px] font-medium", active ? "text-[var(--accent)]" : "text-ink/60")}>{t.label}</span>
                </Link>
              );
            })}
            <button onClick={() => setMobileOpen((v) => !v)} className="relative flex h-full flex-1 flex-col items-center justify-center gap-1">
              {mobileOpen && <motion.span layoutId="atab" className="absolute inset-x-1 inset-y-1.5 rounded-[18px] bg-ink/[0.06]" />}
              <LayoutGrid size={20} className={cx("relative", mobileOpen ? "text-[var(--accent)]" : "text-ink/65")} />
              <span className={cx("relative text-[10.5px] font-medium", mobileOpen ? "text-[var(--accent)]" : "text-ink/60")}>More</span>
            </button>
          </nav>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
