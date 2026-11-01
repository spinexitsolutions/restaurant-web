"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, CalendarDays, ShoppingBag, Users, Inbox, Mail, UtensilsCrossed, Layers, Home, Image as ImageIcon,
  ChefHat, PartyPopper, Newspaper, Ticket, Quote, HelpCircle, Palette, Sparkles, MapPin, Store, Globe, AlertTriangle,
  LogOut, ExternalLink, Menu, X, PanelLeftClose, PanelLeftOpen,
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

  useEffect(() => setMobileOpen(false), [path]);
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("noor-admin-collapsed") === "1");
    } catch {}
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

  const navList = (compact: boolean) => (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
      {NAV.map((g) => (
        <div key={g.group}>
          {!compact && <div className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">{g.group}</div>}
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
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] transition-colors",
                    compact && "justify-center px-0",
                    active ? "text-neutral-900" : "text-neutral-500 hover:bg-black/[0.04] hover:text-neutral-900"
                  )}
                >
                  {active && <motion.span layoutId={compact ? "nav-pill-c" : "nav-pill"} transition={{ type: "spring", stiffness: 500, damping: 40 }} className="absolute inset-0 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]" />}
                  <it.icon size={18} className={cx("relative z-10 shrink-0", active && "text-[var(--accent)]")} />
                  {!compact && <span className="relative z-10 flex-1 truncate font-medium">{it.label}</span>}
                  {count > 0 && (
                    <span className={cx("relative z-10 grid min-w-5 place-items-center rounded-full bg-[var(--accent)] px-1.5 text-[10px] font-semibold leading-5 text-white", compact && "absolute right-1 top-0.5 min-w-4 leading-4")}>
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

  const footer = (compact: boolean) => (
    <div className={cx("space-y-1 border-t border-black/[0.06] p-3", compact && "flex flex-col items-center")}>
      <a href="/" target="_blank" className={cx("flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-black/[0.04]", compact && "px-2.5")}>
        <ExternalLink size={17} /> {!compact && "View website"}
      </a>
      <button onClick={logout} className={cx("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-black/[0.04]", compact && "w-auto px-2.5")}>
        <LogOut size={17} /> {!compact && "Log out"}
      </button>
    </div>
  );

  const logo = (compact: boolean) => (
    <div className={cx("flex items-center gap-2.5 px-6 pb-5 pt-6", compact && "justify-center px-0")}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-neutral-900 font-display text-xl italic text-white">{brand.charAt(0)}</span>
      {!compact && (
        <div className="leading-tight">
          <div className="font-display text-xl tracking-tight">{brand}</div>
          <div className="text-[11px] text-neutral-400">Restaurant OS</div>
        </div>
      )}
    </div>
  );

  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="min-h-dvh bg-[#F5F5F7] font-sans text-neutral-900">
          {/* Desktop sidebar */}
          <aside className={cx("fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-black/[0.06] bg-[#F5F5F7]/80 backdrop-blur-xl transition-[width] duration-300 lg:flex", collapsed ? "w-[76px]" : "w-[264px]")}>
            {logo(collapsed)}
            {navList(collapsed)}
            {footer(collapsed)}
            <button onClick={toggleCollapse} className="absolute -right-3 top-8 grid h-6 w-6 place-items-center rounded-full border border-black/10 bg-white text-neutral-500 shadow-sm hover:text-neutral-900" aria-label="Collapse sidebar">
              {collapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
            </button>
          </aside>

          {/* Mobile top bar */}
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-black/[0.06] bg-[#F5F5F7]/80 px-4 py-3 backdrop-blur-xl lg:hidden">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-900 font-display text-lg italic text-white">{brand.charAt(0)}</span>
              <span className="font-display text-lg">{brand}</span>
              <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium text-neutral-500">Admin</span>
            </div>
            <button onClick={() => setMobileOpen(true)} className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm" aria-label="Open menu">
              <Menu size={18} />
            </button>
          </header>

          <AnimatePresence>
            {mobileOpen && (
              <div className="fixed inset-0 z-[70] lg:hidden">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 380, damping: 40 }} className="absolute inset-y-0 left-0 flex w-[84%] max-w-[300px] flex-col bg-[#F5F5F7]">
                  <div className="flex items-center justify-between pr-4">
                    {logo(false)}
                    <button onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-black/5">
                      <X size={18} />
                    </button>
                  </div>
                  {navList(false)}
                  {footer(false)}
                </motion.aside>
              </div>
            )}
          </AnimatePresence>

          <main className={cx("transition-[padding] duration-300", collapsed ? "lg:pl-[76px]" : "lg:pl-[264px]")}>
            <motion.div key={path} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-[1400px] px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
              {children}
            </motion.div>
          </main>

          {/* Mobile bottom tab bar */}
          <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-[22px] border border-black/[0.06] bg-white/85 px-2 py-1.5 pb-[max(6px,env(safe-area-inset-bottom))] shadow-xl shadow-black/10 backdrop-blur-xl lg:hidden">
            {MOBILE_TABS.map((t) => {
              const active = isActive(path, t.href);
              const count = t.badge ? counts[t.badge] : 0;
              return (
                <Link key={t.href} href={t.href} className={cx("relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-medium", active ? "text-[var(--accent)]" : "text-neutral-500")}>
                  <t.icon size={20} />
                  {t.label}
                  {count > 0 && <span className="absolute right-[22%] top-0.5 grid min-w-4 place-items-center rounded-full bg-[var(--accent)] px-1 text-[9px] leading-4 text-white">{count}</span>}
                </Link>
              );
            })}
            <button onClick={() => setMobileOpen(true)} className="flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium text-neutral-500">
              <Menu size={20} />
              More
            </button>
          </nav>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
