"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import type { Settings } from "@/lib/types";

/* ───────── Site settings ───────── */
const SiteCtx = createContext<Settings | null>(null);
export const useSite = () => useContext(SiteCtx)!;

/* ───────── Intro state (hero waits for the curtain) ───────── */
const IntroCtx = createContext<{ done: boolean; setDone: (v: boolean) => void }>({ done: true, setDone: () => {} });
export const useIntro = () => useContext(IntroCtx);

/* ───────── Smooth scroll ───────── */
const LenisCtx = createContext<{ current: Lenis | null }>({ current: null });
export const useLenis = () => useContext(LenisCtx);

/* ───────── Cart ───────── */
export interface CartLine {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}
interface CartApi {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (l: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  bump: number;
  hydrated: boolean;
}
const CartCtx = createContext<CartApi | null>(null);
export const useCart = () => useContext(CartCtx)!;

export function SiteProviders({ settings, children, initialIntro }: { settings: Settings; children: ReactNode; initialIntro: boolean }) {
  const [introDone, setIntroDone] = useState(!initialIntro);
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), touchMultiplier: 1.4 });
    lenisRef.current = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  useEffect(() => {
    if (!introDone) lenisRef.current?.stop();
    else lenisRef.current?.start();
  }, [introDone]);

  /* cart */
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("noor-cart");
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("noor-cart", JSON.stringify(lines));
    } catch {}
  }, [lines, hydrated]);
  useEffect(() => {
    if (open) lenisRef.current?.stop();
    else if (introDone) lenisRef.current?.start();
  }, [open, introDone]);

  const add = useCallback((l: Omit<CartLine, "qty">, qty = 1) => {
    setLines((prev) => {
      const ex = prev.find((p) => p.id === l.id);
      if (ex) return prev.map((p) => (p.id === l.id ? { ...p, qty: Math.min(20, p.qty + qty) } : p));
      return [...prev, { ...l, qty }];
    });
    setBump((b) => b + 1);
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) => (qty <= 0 ? prev.filter((p) => p.id !== id) : prev.map((p) => (p.id === id ? { ...p, qty: Math.min(20, qty) } : p))));
  }, []);
  const clear = useCallback(() => setLines([]), []);

  const cart = useMemo<CartApi>(
    () => ({
      lines,
      count: lines.reduce((t, l) => t + l.qty, 0),
      subtotal: lines.reduce((t, l) => t + l.qty * l.price, 0),
      open,
      setOpen,
      add,
      setQty,
      clear,
      bump,
      hydrated,
    }),
    [lines, open, add, setQty, clear, bump, hydrated]
  );

  return (
    <SiteCtx.Provider value={settings}>
      <LenisCtx.Provider value={lenisRef}>
        <IntroCtx.Provider value={{ done: introDone, setDone: setIntroDone }}>
          <CartCtx.Provider value={cart}>{children}</CartCtx.Provider>
        </IntroCtx.Provider>
      </LenisCtx.Provider>
    </SiteCtx.Provider>
  );
}
