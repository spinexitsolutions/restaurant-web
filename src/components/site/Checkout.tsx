"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Bike, Store, Minus, Plus, Loader2, Tag, X, ArrowRight, Banknote, Smartphone, CreditCard } from "lucide-react";
import clsx from "clsx";
import type { MenuItem } from "@/lib/types";
import { money } from "@/lib/format";
import { useCart, useSite } from "./providers";
import { EASE } from "./motion";
import { Field } from "./ReserveWizard";
import AddButton from "./home/AddButton";

export default function Checkout({ suggestions }: { suggestions: MenuItem[] }) {
  const s = useSite();
  const o = s.ordering;
  const cart = useCart();
  const router = useRouter();
  const [type, setType] = useState<"delivery" | "pickup">("delivery");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });
  const [payment, setPayment] = useState<"cod" | "upi" | "card">("upi");
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponErr, setCouponErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = cart.subtotal;
  const discount = coupon ? Math.round((subtotal * coupon.discount) / 100) : 0;
  const deliveryFee = type === "delivery" && subtotal < o.freeDeliveryAbove ? o.deliveryFee : 0;
  const tax = Math.round(((subtotal - discount) * o.taxRate) / 100);
  const total = subtotal - discount + tax + deliveryFee;

  async function apply() {
    setCouponErr("");
    const r = await fetch("/api/coupon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, subtotal }) });
    const j = await r.json();
    if (!r.ok) return setCouponErr(j.error);
    setCoupon(j);
  }

  async function place(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const r = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, type, payment, coupon: coupon?.code, items: cart.lines.map((l) => ({ itemId: l.id, qty: l.qty })) }),
    });
    const j = await r.json();
    if (!r.ok) {
      setLoading(false);
      return setError(j.error || "Couldn't place your order.");
    }
    cart.clear();
    router.push(`/order/${j.code}`);
  }

  if (!o.enabled) {
    return <p className="mx-auto max-w-xl px-5 pb-32 text-center text-muted">Online ordering is paused right now — please call {s.contact.phone}.</p>;
  }

  if (!cart.hydrated) return <div className="mx-auto h-[60vh] max-w-[1400px] animate-pulse rounded-[30px] bg-ink/5" />;

  if (cart.count === 0) {
    return (
      <div className="mx-auto max-w-[1400px] px-5 pb-32 sm:px-10">
        <div className="rounded-[30px] bg-cream p-8 text-center ring-1 ring-ink/5 sm:p-14">
          <h2 className="display text-[34px]">Your bag is empty.</h2>
          <p className="mt-3 text-muted">Start with something everyone orders:</p>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
            {suggestions.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-[20px] bg-paper p-3 ring-1 ring-ink/5">
                <img src={m.image} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{m.name}</div>
                  <div className="font-mono text-[13px] text-muted">{money(m.price, o.currency)}</div>
                </div>
                <AddButton item={m} />
              </div>
            ))}
          </div>
          <Link href="/menu" className="mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-paper">
            Full menu <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={place} className="mx-auto grid max-w-[1400px] gap-8 px-5 pb-32 sm:px-10 lg:grid-cols-[minmax(0,1fr)_440px]">
      <div className="space-y-6">
        {/* type */}
        <div className="grid grid-cols-2 gap-1 rounded-full bg-ink/5 p-1">
          {([
            ["delivery", "Delivery", Bike, `~${o.etaMinutes} min`],
            ["pickup", "Pickup", Store, "~20 min"],
          ] as const).map(([v, l, Icon, sub]) => (
            <button type="button" key={v} onClick={() => setType(v)} className={clsx("relative flex h-14 items-center justify-center gap-2 rounded-full text-[15px]", type === v ? "text-paper" : "text-ink/70")}>
              {type === v && <motion.span layoutId="ordertype" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.45, ease: EASE }} />}
              <Icon size={18} className="relative" />
              <span className="relative">{l}</span>
              <span className="relative hidden text-[12px] opacity-60 sm:inline">· {sub}</span>
            </button>
          ))}
        </div>

        <section className="rounded-[28px] bg-cream p-5 ring-1 ring-ink/5 sm:p-8">
          <h2 className="display mb-6 text-[28px]">Your details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} autoComplete="name" />
            <Field label="Phone" required type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} autoComplete="tel" />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} autoComplete="email" className="sm:col-span-2" />
            <AnimatePresence initial={false}>
              {type === "delivery" && (
                <motion.div className="sm:col-span-2" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>
                  <Field label="Delivery address" required value={form.address} onChange={(v) => setForm({ ...form, address: v })} autoComplete="street-address" />
                </motion.div>
              )}
            </AnimatePresence>
            <Field label="Notes for the kitchen (optional)" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} className="sm:col-span-2" />
          </div>
        </section>

        <section className="rounded-[28px] bg-cream p-5 ring-1 ring-ink/5 sm:p-8">
          <h2 className="display mb-6 text-[28px]">Payment</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {([
              ["upi", "UPI", Smartphone],
              ["card", "Card on delivery", CreditCard],
              ["cod", "Cash", Banknote],
            ] as const).map(([v, l, Icon]) => (
              <button
                type="button"
                key={v}
                onClick={() => setPayment(v)}
                className={clsx("flex h-16 items-center gap-3 rounded-[18px] px-4 text-left text-[15px] transition", payment === v ? "bg-ink text-paper" : "bg-paper ring-1 ring-ink/10 hover:ring-ink/30")}
              >
                <Icon size={18} /> {l}
              </button>
            ))}
          </div>
        </section>

        {suggestions.length > 0 && (
          <section>
            <div className="eyebrow mb-3 text-muted">Goes well with</div>
            <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 no-scrollbar sm:mx-0 sm:px-0">
              {suggestions.filter((m) => !cart.lines.some((l) => l.id === m.id)).map((m) => (
                <div key={m.id} className="flex w-64 shrink-0 items-center gap-3 rounded-[20px] bg-cream p-3 ring-1 ring-ink/5">
                  <img src={m.image} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-medium">{m.name}</div>
                    <div className="font-mono text-[12px] text-muted">{money(m.price, o.currency)}</div>
                  </div>
                  <AddButton item={m} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[28px] bg-ink p-6 text-paper sm:p-8">
          <h2 className="display mb-5 text-[28px]">Order summary</h2>
          <ul className="max-h-[38vh] space-y-4 overflow-y-auto pr-1" data-lenis-prevent>
            {cart.lines.map((l) => (
              <li key={l.id} className="flex items-center gap-3">
                <img src={l.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px]">{l.name}</div>
                  <div className="mt-1 flex w-fit items-center gap-1 rounded-full bg-white/10 p-0.5">
                    <button type="button" aria-label="Decrease" onClick={() => cart.setQty(l.id, l.qty - 1)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-white/10"><Minus size={11} /></button>
                    <span className="w-5 text-center text-[12px] tabular-nums">{l.qty}</span>
                    <button type="button" aria-label="Increase" onClick={() => cart.setQty(l.id, l.qty + 1)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-white/10"><Plus size={11} /></button>
                  </div>
                </div>
                <span className="font-mono text-[14px] tabular-nums">{money(l.price * l.qty, o.currency)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            {coupon ? (
              <div className="flex items-center justify-between rounded-full bg-emerald-500/15 px-4 py-2.5 text-[14px] text-emerald-300">
                <span className="flex items-center gap-2"><Tag size={14} /> {coupon.code} · {coupon.discount}% off</span>
                <button type="button" onClick={() => setCoupon(null)} aria-label="Remove coupon"><X size={14} /></button>
              </div>
            ) : (
              <div className="flex gap-2 rounded-full bg-white/10 p-1">
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Promo code" className="h-10 flex-1 bg-transparent px-4 font-mono text-[14px] tracking-wider outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-paper/40" />
                <button type="button" onClick={apply} disabled={!code} className="h-10 rounded-full bg-paper px-4 text-[13px] font-medium text-ink disabled:opacity-40">Apply</button>
              </div>
            )}
            {couponErr && <p className="mt-2 px-2 text-[13px] text-red-300">{couponErr}</p>}
          </div>

          <dl className="mt-6 space-y-2 border-t border-white/10 pt-5 text-[14px]">
            <Row k="Subtotal" v={money(subtotal, o.currency)} />
            {discount > 0 && <Row k="Discount" v={`−${money(discount, o.currency)}`} accent />}
            <Row k={`Taxes (${o.taxRate}%)`} v={money(tax, o.currency)} />
            {type === "delivery" && <Row k="Delivery" v={deliveryFee ? money(deliveryFee, o.currency) : "Free"} />}
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-4">
            <span className="text-paper/60">Total</span>
            <motion.span key={total} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="display text-[34px] tabular-nums">{money(total, o.currency)}</motion.span>
          </div>
          {subtotal < o.minOrder && <p className="mt-3 text-[13px] text-amber-300">Minimum order is {money(o.minOrder, o.currency)}.</p>}
          {error && <p className="mt-3 text-[13px] text-red-300">{error}</p>}
          <motion.button whileTap={{ scale: 0.97 }} disabled={loading || subtotal < o.minOrder} className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent font-medium disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <>Place order · {money(total, o.currency)}</>}
          </motion.button>
        </div>
      </aside>
    </form>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className={clsx("flex justify-between", accent ? "text-emerald-300" : "text-paper/70")}>
      <dt>{k}</dt>
      <dd className="font-mono tabular-nums">{v}</dd>
    </div>
  );
}
