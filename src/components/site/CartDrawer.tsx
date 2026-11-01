"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, X, ArrowRight } from "lucide-react";
import { useCart, useSite } from "./providers";
import { EASE } from "./motion";
import { money } from "@/lib/format";

export default function CartDrawer() {
  const cart = useCart();
  const s = useSite();
  const o = s.ordering;
  const toFree = Math.max(0, o.freeDeliveryAbove - cart.subtotal);
  return (
    <AnimatePresence>
      {cart.open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-ink/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => cart.setOpen(false)}
          />
          <motion.aside
            data-lenis-prevent
            className="fixed bottom-0 right-0 top-0 z-[71] flex w-full max-w-[440px] flex-col bg-paper sm:bottom-3 sm:right-3 sm:top-3 sm:rounded-[28px]"
            initial={{ x: "105%" }}
            animate={{ x: 0 }}
            exit={{ x: "105%" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="flex items-center justify-between px-6 pb-4 pt-6">
              <div>
                <div className="eyebrow text-muted">Your bag</div>
                <div className="display text-[28px]">{cart.count ? `${cart.count} item${cart.count > 1 ? "s" : ""}` : "Empty, for now"}</div>
              </div>
              <button aria-label="Close" onClick={() => cart.setOpen(false)} className="grid h-11 w-11 place-items-center rounded-full bg-ink/5 hover:bg-ink/10">
                <X size={18} />
              </button>
            </div>

            {cart.count > 0 && o.freeDeliveryAbove > 0 && (
              <div className="mx-6 mb-2 rounded-2xl bg-ink/[0.04] p-3 text-[13px]">
                {toFree > 0 ? (
                  <>Add <b>{money(toFree, o.currency)}</b> more for free delivery</>
                ) : (
                  <>You&apos;ve unlocked <b>free delivery</b> ✦</>
                )}
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/10">
                  <motion.div className="h-full bg-accent" animate={{ width: `${Math.min(100, (cart.subtotal / o.freeDeliveryAbove) * 100)}%` }} transition={{ ease: EASE, duration: 0.6 }} />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6">
              {cart.count === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-5 text-center text-muted">
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-ink/5">
                    <ShoppingBag strokeWidth={1.2} />
                  </div>
                  <p className="max-w-[24ch]">Good food is a click away. Start with a signature.</p>
                  <Link href="/menu" onClick={() => cart.setOpen(false)} className="rounded-full bg-ink px-5 py-3 text-sm text-paper">
                    Browse the menu
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  <AnimatePresence initial={false}>
                    {cart.lines.map((l) => (
                      <motion.li
                        key={l.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="flex gap-4 py-4"
                      >
                        <img src={l.image} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between gap-2">
                            <span className="font-medium leading-tight">{l.name}</span>
                            <span className="tabular-nums">{money(l.price * l.qty, o.currency)}</span>
                          </div>
                          <span className="text-[13px] text-muted">{money(l.price, o.currency)} each</span>
                          <div className="mt-auto flex w-fit items-center gap-1 rounded-full border border-line p-0.5">
                            <button aria-label="Decrease" onClick={() => cart.setQty(l.id, l.qty - 1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-ink/5">
                              <Minus size={13} />
                            </button>
                            <span className="w-6 text-center text-sm tabular-nums">{l.qty}</span>
                            <button aria-label="Increase" onClick={() => cart.setQty(l.id, l.qty + 1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-ink/5">
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {cart.count > 0 && (
              <div className="border-t border-line p-6">
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="display text-[24px] tabular-nums">{money(cart.subtotal, o.currency)}</span>
                </div>
                <Link
                  href="/order"
                  onClick={() => cart.setOpen(false)}
                  className="group flex h-14 w-full items-center justify-between rounded-full bg-ink pl-6 pr-2 text-paper"
                >
                  <span className="font-medium">Checkout</span>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-accent transition-transform group-hover:translate-x-0.5">
                    <ArrowRight size={18} />
                  </span>
                </Link>
                <p className="mt-3 text-center text-[12px] text-muted">Taxes & delivery calculated at checkout · ~{o.etaMinutes} min</p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
