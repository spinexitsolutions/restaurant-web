"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Bike, Columns3, List, Printer, ShoppingBag, Store, Trash2, X, Phone, MapPin } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/types";
import { money, timeAgo, fmtDate } from "@/lib/format";
import { api, Avatar, Badge, Button, Card, Drawer, Empty, PageHeader, SearchInput, Segmented, StatusBadge, useConfirm, useToast, cx } from "./ui";

const FLOW: OrderStatus[] = ["new", "preparing", "ready", "out-for-delivery", "completed"];
const COLS: { s: OrderStatus; label: string; dot: string }[] = [
  { s: "new", label: "New", dot: "bg-[var(--accent)]" },
  { s: "preparing", label: "Preparing", dot: "bg-amber-400" },
  { s: "ready", label: "Ready", dot: "bg-sky-400" },
  { s: "out-for-delivery", label: "On the way", dot: "bg-violet-400" },
  { s: "completed", label: "Completed", dot: "bg-emerald-400" },
  { s: "cancelled", label: "Cancelled", dot: "bg-neutral-300" },
];

function nextStatus(o: Order): OrderStatus | null {
  if (o.status === "cancelled" || o.status === "completed") return null;
  if (o.status === "ready" && o.type === "pickup") return "completed";
  return FLOW[FLOW.indexOf(o.status) + 1] || null;
}
const NEXT_LABEL: Partial<Record<OrderStatus, string>> = { preparing: "Start preparing", ready: "Mark ready", "out-for-delivery": "Send out", completed: "Complete" };

export default function Orders({ orders, currency }: { orders: Order[]; currency: string }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [view, setView] = useState<"board" | "list">("board");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return [...orders]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .filter((o) => !s || [o.code, o.name, o.phone, o.address].some((v) => v.toLowerCase().includes(s)));
  }, [orders, q]);
  const open = orders.find((o) => o.id === openId) || null;

  async function setStatus(o: Order, status: OrderStatus) {
    setBusy(o.id);
    try {
      await api(`/api/admin/c/orders/${o.id}`, "PATCH", { status });
      toast(`#${o.code} → ${status.replace(/-/g, " ")}`);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(null);
    }
  }
  async function del(o: Order) {
    if (!(await confirm(`Delete order #${o.code}?`))) return;
    await api(`/api/admin/c/orders/${o.id}`, "DELETE");
    setOpenId(null);
    toast("Order deleted");
    router.refresh();
  }

  const live = orders.filter((o) => !["completed", "cancelled"].includes(o.status));
  const todayRev = orders.filter((o) => o.status !== "cancelled" && o.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).reduce((s, o) => s + o.total, 0);

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={`${live.length} live orders · ${money(todayRev, currency)} today`}
        actions={
          <>
            <SearchInput value={q} onChange={setQ} placeholder="Order #, name, phone…" />
            <Segmented layoutId="ord-view" value={view} onChange={setView} options={[{ value: "board", label: <><Columns3 size={14} /> Board</> }, { value: "list", label: <><List size={14} /> List</> }]} />
          </>
        }
      />

      {filtered.length === 0 ? (
        <Empty icon={<ShoppingBag size={32} />} title="No orders" text="Online orders will land here in real time." />
      ) : view === "board" ? (
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          {COLS.map((c) => {
            const items = filtered.filter((o) => o.status === c.s);
            return (
              <div key={c.s} className="w-[82vw] max-w-[300px] shrink-0 snap-start sm:w-[290px]">
                <div className="mb-2.5 flex items-center gap-2 px-1">
                  <span className={cx("h-2 w-2 rounded-full", c.dot)} />
                  <span className="text-sm font-semibold">{c.label}</span>
                  <span className="rounded-full bg-black/5 px-2 text-xs font-medium text-neutral-500">{items.length}</span>
                </div>
                <div className="min-h-[200px] space-y-2.5 rounded-2xl bg-black/[0.03] p-2">
                  <AnimatePresence initial={false}>
                    {items.map((o) => {
                      const n = nextStatus(o);
                      return (
                        <motion.div key={o.id} layoutId={`order-${o.id}`} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 34 }}>
                          <Card className="cursor-pointer p-3.5 transition hover:shadow-md" onClick={() => setOpenId(o.id)}>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-semibold">#{o.code}</span>
                              <span className="text-[11px] text-neutral-400">{timeAgo(o.createdAt)}</span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="truncate text-sm font-medium">{o.name}</span>
                              <Badge tone={o.type === "delivery" ? "violet" : "blue"}>
                                {o.type === "delivery" ? <Bike size={11} /> : <Store size={11} />} {o.type}
                              </Badge>
                            </div>
                            <div className="mt-1.5 line-clamp-2 text-xs text-neutral-500">{o.items.map((l) => `${l.qty}× ${l.name}`).join(", ")}</div>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold">{money(o.total, currency)}</span>
                              {n && (
                                <Button size="sm" variant={o.status === "new" ? "primary" : "dark"} loading={busy === o.id} onClick={(e) => { e.stopPropagation(); setStatus(o, n); }}>
                                  {NEXT_LABEL[n]} <ArrowRight size={13} />
                                </Button>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {items.length === 0 && <div className="py-10 text-center text-xs text-neutral-400">Nothing here</div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="divide-y divide-black/[0.05] overflow-hidden">
          {filtered.map((o) => (
            <div key={o.id} onClick={() => setOpenId(o.id)} className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-[#FAFAFB] sm:px-5">
              <Avatar name={o.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="truncate">{o.name}</span>
                  <span className="font-mono text-xs text-neutral-400">#{o.code}</span>
                </div>
                <div className="truncate text-xs text-neutral-500">
                  {o.items.reduce((s, l) => s + l.qty, 0)} items · {o.type} · {o.payment.toUpperCase()} · {timeAgo(o.createdAt)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{money(o.total, currency)}</div>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}
        </Card>
      )}

      <Drawer
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open ? <span>Order <span className="font-mono">#{open.code}</span></span> : ""}
        footer={
          open && (
            <>
              <Button variant="danger" onClick={() => del(open)} className="mr-auto"><Trash2 size={15} /></Button>
              <Button onClick={() => window.print()}><Printer size={15} /> Print</Button>
              {open.status !== "cancelled" && open.status !== "completed" && (
                <Button onClick={() => setStatus(open, "cancelled")}><X size={15} /> Cancel</Button>
              )}
              {nextStatus(open) && (
                <Button variant="primary" loading={busy === open.id} onClick={() => setStatus(open, nextStatus(open)!)}>
                  {NEXT_LABEL[nextStatus(open)!]}
                </Button>
              )}
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            {/* progress */}
            <div className="flex items-center gap-1">
              {(open.type === "pickup" ? FLOW.filter((s) => s !== "out-for-delivery") : FLOW).map((s, i, arr) => {
                const reached = open.status !== "cancelled" && arr.indexOf(open.status) >= i;
                return (
                  <div key={s} className="flex-1">
                    <div className={cx("h-1.5 rounded-full transition-colors", reached ? "bg-[var(--accent)]" : "bg-black/10")} />
                    <div className={cx("mt-1.5 text-[10px] capitalize", reached ? "text-neutral-800" : "text-neutral-400")}>{s.replace(/-/g, " ")}</div>
                  </div>
                );
              })}
            </div>
            {open.status === "cancelled" && <Badge tone="red">Cancelled</Badge>}

            <Card className="space-y-2 p-4 text-sm">
              <div className="font-medium">{open.name}</div>
              <a href={`tel:${open.phone}`} className="flex items-center gap-2 text-neutral-600"><Phone size={14} /> {open.phone}</a>
              {open.address && <div className="flex items-start gap-2 text-neutral-600"><MapPin size={14} className="mt-0.5 shrink-0" /> {open.address}</div>}
              {open.notes && <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">“{open.notes}”</div>}
            </Card>

            {/* receipt */}
            <div className="relative rounded-2xl bg-white p-5 font-mono text-[13px] shadow-sm ring-1 ring-black/[0.06]">
              <div className="text-center">
                <div className="font-display text-2xl italic">Noor</div>
                <div className="text-[11px] text-neutral-400">{fmtDate(open.createdAt, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                <div className="text-[11px] uppercase tracking-widest text-neutral-400">{open.type} · {open.payment}</div>
              </div>
              <div className="my-4 border-t border-dashed border-black/20" />
              <div className="space-y-1.5">
                {open.items.map((l, i) => (
                  <div key={i} className="flex justify-between gap-3">
                    <span>{l.qty} × {l.name}</span>
                    <span>{money(l.price * l.qty, currency)}</span>
                  </div>
                ))}
              </div>
              <div className="my-4 border-t border-dashed border-black/20" />
              <div className="space-y-1 text-neutral-600">
                <Row k="Subtotal" v={money(open.subtotal, currency)} />
                {open.discount > 0 && <Row k={`Discount (${open.coupon})`} v={`−${money(open.discount, currency)}`} />}
                <Row k="Tax" v={money(open.tax, currency)} />
                <Row k="Delivery" v={open.deliveryFee ? money(open.deliveryFee, currency) : "Free"} />
              </div>
              <div className="mt-3 flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{money(open.total, currency)}</span>
              </div>
              <div className="mt-4 text-center text-[11px] text-neutral-400">Thank you · #{open.code}</div>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
}
